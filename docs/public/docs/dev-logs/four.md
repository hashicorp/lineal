---
title: Dev Log 04
order: 4
---

# Dev Log 04: More Scale and More Marks

[Lineal v0.3.0 just shipped](https://www.npmjs.com/package/@lineal-viz/lineal)! This release includes two new scales and two new marks, which lay the foundations for common charts like bars and bubbles.

## Scales Pt. 2

If this is the first time you are hearing about scales, may I suggest you read [Dev Log 01](/docs/dev-logs/a-dev-log-one) and come right back.

Super briefly, the purpose of a scale is mapping a value from data space (`domain`) to pixel space (`range`). Scales broadly fit into four categories:

1. Continuous domain -> continous range (e.g., Lineal, Power, Logarithmic, Sqrt)
2. Continuous domain -> discrete range (e.g., Quantize, Quantile)
3. Discrete domain -> discrete range (e.g., Ordinal)
4. Discrete domain -> continuous range

It's this fourth category that the new Band and Point scales fall under.

## Let's make a bar chart

A quintessential type of chart is the histogram. It visualizes the quantity of bins as bars. All the bars shown together captures the distribution of the data across the bins.

Choosing a bin size for a histogram is actually a bit of an open statistics question. Too many bins means you aren't seeing a distribution at all, too few bins means interesting dips in data get clumped together and lost in a single bin.

So what we'll do is side-step that problem entirely (some day Lineal will have utilities for doing [data transformation such binning](https://vega.github.io/vega-lite/docs/bin.html), but not today).

Instead, let's assume the data has already been binned and our task is to draw rectangles with axes and gridlines. The x-axis is our bins and the y-axis is the quantity. Since the y-axis is mapping a continuous domain (quantity) to a continuous range (rectangle y coordinate and height) this one gets to use an existing scale, `ScaleLinear`. But the x-axis is mapping a discrete domain (bins) to a continuous range (rectangle x coordinate and width). So we'll have to use one of the new scales for this.

- `ScalePoint`: Divides a numeric range into X segments where X is the number of elements in the discrete domain. Calling the scale with a value returns the point in the numeric range that maps to the segment in the scale that corresponds with the value.
- `ScaleBand`: Divides a numeric range into X segments just like `ScalePoint`. Additionally, the range is divided based on a band width that is tunable using padding values.

Since we need to determine the rectangle x coordinate as well as the width, we want to use the `ScaleBand` since it has the derived `band` value in addition to the partitioning of a range.

```hbs preview-template
<div class="demo-chart-with-axes">
  <svg width="500" height="600" style="overflow:visible;">
    <title>
      Some sort of property in a population broken down by age using Experian
      demographic buckets.
    </title>
    {{#let
      (scale-band
        domain=(array "0-18" "19-29" "30-39" "40-49" "50-59" "60-64" "65+")
        range="0..500"
        padding=0.1
      )
      (scale-linear range="600..0" domain="0..")
      as |xScale yScale|
    }}
      {{#if (and xScale.isValid yScale.isValid)}}
        <Lineal::GridLines
          @scale={{yScale}}
          @direction="horizontal"
          @length="500"
        />
        <Lineal::Axis
          @scale={{yScale}}
          @orientation="left"
          @includeDomain={{false}}
        />
        <Lineal::Axis
          @scale={{xScale}}
          @orientation="bottom"
          transform="translate(0,{{yScale.range.min}})"
        />
      {{/if}}
      {{! this is just here to qualify the scales }}
      <Lineal::Line
        @data={{data "histogram"}}
        @x="bin"
        @y="value"
        @xScale={{xScale}}
        @yScale={{yScale}}
        fill="transparent"
        stroke="transparent"
      />
    {{/let}}
  </svg>
</div>
```

With our scales established, let's draw some rectangles.

```hbs preview-template
<div class="demo-chart-with-axes">
  <svg width="500" height="600" style="overflow:visible;">
    <title>
      Some sort of property in a population broken down by age using Experian
      demographic buckets.
    </title>
    {{#let
      (scale-band
        domain=(array "0-18" "19-29" "30-39" "40-49" "50-59" "60-64" "65+")
        range="0..500"
        padding=0.1
      )
      (scale-linear range="600..0" domain="0..")
      (scale-linear range="0..600" domain="0..")
      as |xScale yScale hScale|
    }}
      {{#if (and xScale.isValid yScale.isValid)}}
        <Lineal::GridLines
          @scale={{yScale}}
          @direction="horizontal"
          @length="500"
        />
      {{/if}}
      <Lineal::Bars
        @data={{data "histogram"}}
        @x="bin"
        @y="value"
        @height="value"
        @width={{xScale.bandwidth}}
        @xScale={{xScale}}
        @yScale={{yScale}}
        @heightScale={{hScale}}
        style="fill:var(--c-blue-line);"
      />
      {{#if (and xScale.isValid yScale.isValid)}}
        <Lineal::Axis
          @scale={{yScale}}
          @orientation="left"
          @includeDomain={{false}}
        />
        <Lineal::Axis
          @scale={{xScale}}
          @orientation="bottom"
          transform="translate(0,{{yScale.range.min}})"
        />
      {{/if}}
    {{/let}}
  </svg>
</div>
```

If you look closely, you'll notice that a third scale snuck in. Recall that there are four encodings for bars: `x`, `y`, `width`, and `height`. `width` is a static number that we get from the band scale, so we need three scales for the remaining encodings.

A neat property of `y` and `height` for this particular chart is that they are supplementary: `y + height == range.max`. Because of this property, `hScale` and `yScale` can be modeled as inverses.

## Let's make a punchcard chart

This is another fun chart for showing distributions across two dimensions. It also conveniently exercises the new `ScalePoint` and `Points` mark. We'll make a fairly typical activity chart here, plotting hours on the x-axis and days of the week on the y-axis. A chart like this helps analysts identity usage patterns (e.g., does activity skew towards a 9-5 schedule? Are weekends less busy than week days?).

```hbs preview-template
<div class="demo-chart-with-axes with-left-axis">
  <Lineal::Fluid as |width height|>
    <svg class="fluid" height="500" style="overflow:visible;">
      <title>
        Some sort of property in a population broken down by age using Experian
        demographic buckets.
      </title>
      {{#let
        (scale-linear domain="0..23" range=(array 0 width))
        (scale-point domain=(data "days") range="0..500")
        as |xScale yScale|
      }}
        {{#if (and xScale.isValid yScale.isValid)}}
          <Lineal::GridLines
            @scale={{yScale}}
            @direction="horizontal"
            @length={{width}}
          />
          <Lineal::GridLines
            @scale={{xScale}}
            @direction="vertical"
            @length="500"
          />
          <Lineal::Axis @scale={{yScale}} @orientation="left" />
          <Lineal::Axis
            @scale={{xScale}}
            @orientation="bottom"
            transform="translate(0,500)"
          />
        {{/if}}
        {{! this is just here to qualify the scales }}
        <Lineal::Line
          @data={{data "activity"}}
          @x="hour"
          @y="day"
          @xScale={{xScale}}
          @yScale={{yScale}}
          fill="transparent"
          stroke="transparent"
        />
      {{/let}}
    </svg>
  </Lineal::Fluid>
</div>
```

This should look pretty much the same as the axes and bars for our bar chart above. The key differences to consider are

- **Using a fixed domain**: Since we know there are 7 ordered days in a week and 24 ordered hours in a day, we want to specify these rather than letting Lineal determine the domains of the dataset on its own. This would lead to errors in the event that the dataset had no data for a particular day or a particular hour.
- **Making room for circle sizes**: The range for the size scale for the points will need to fit within the step size of both the x-scale and the y-scale. Assuming the x and y scale ranges are hardcoded, then this math can be done upfront.

```hbs preview-template
<div class="demo-chart-with-axes with-left-axis">
  <Lineal::Fluid as |width height|>
    <svg class="fluid" height="300" style="overflow:visible;">
      <title>
        Some sort of property in a population broken down by age using Experian
        demographic buckets.
      </title>
      {{#let
        (scale-linear domain="0..23" range=(array 0 width))
        (scale-point domain=(data "days") range="0..300" padding=0.5)
        as |xScale yScale|
      }}
        {{#if (and xScale.isValid yScale.isValid)}}
          <Lineal::GridLines
            @scale={{yScale}}
            @direction="horizontal"
            @length={{width}}
          />
          <Lineal::GridLines
            @scale={{xScale}}
            @direction="vertical"
            @length="300"
          />
          <Lineal::Axis
            @scale={{yScale}}
            @orientation="left"
            @includeDomain={{false}}
          />
          <Lineal::Axis
            @scale={{xScale}}
            @orientation="top"
            @includeDomain={{false}}
          />
        {{/if}}
        <Lineal::Points
          @data={{data "activity"}}
          @x="hour"
          @y="day"
          @size="value"
          @color="day"
          @xScale={{xScale}}
          @yScale={{yScale}}
          @sizeScale={{scale-sqrt
            domain="1..20"
            range=(array 2 (div width 48))
          }}
          @colorScale={{scale-ordinal
            domain=(data "days")
            range=(css-range "ordinal")
          }}
        />
      {{/let}}
    </svg>
  </Lineal::Fluid>
</div>
```

Points themselves can still feel squishy from an analytics perspective. [Our perception of differences in area isn't very good](https://courses.ischool.berkeley.edu/i247/f05/readings/Cleveland_GraphicalPerception_Science85.pdf), so let's add text.

```hbs preview-template
<div class="demo-chart-with-axes with-left-axis">
  <Lineal::Fluid as |width height|>
    <svg class="fluid" height="300" style="overflow:visible;">
      <title>
        Some sort of property in a population broken down by age using Experian
        demographic buckets.
      </title>
      {{#let
        (scale-linear domain="0..23" range=(array 0 width))
        (scale-point domain=(data "days") range="0..300" padding=0.5)
        as |xScale yScale|
      }}
        {{#if (and xScale.isValid yScale.isValid)}}
          <Lineal::GridLines
            @scale={{yScale}}
            @direction="horizontal"
            @length={{width}}
          />
          <Lineal::GridLines
            @scale={{xScale}}
            @direction="vertical"
            @length="300"
          />
          <Lineal::Axis
            @scale={{yScale}}
            @orientation="left"
            @includeDomain={{false}}
          />
          <Lineal::Axis
            @scale={{xScale}}
            @orientation="top"
            @includeDomain={{false}}
          />
        {{/if}}
        <Lineal::Points
          @data={{data "activity"}}
          @renderCircles={{true}}
          @x="hour"
          @y="day"
          @size="value"
          @color="day"
          @xScale={{xScale}}
          @yScale={{yScale}}
          @sizeScale={{scale-sqrt
            domain="1..20"
            range=(array 2 (div width 48))
          }}
          @colorScale={{scale-ordinal
            domain=(data "days")
            range=(css-range "ordinal")
          }}
          as |points|
        >
          {{#each points as |p|}}
            <text
              class="plot-label {{if (lt p.size 12) 'plot-label--dark'}}"
              x={{p.x}}
              y={{p.y}}
              dy={{if (lt p.size 12) "-15"}}
            >{{fmt p.datum.value}}</text>
          {{/each}}
        </Lineal::Points>
      {{/let}}
    </svg>
  </Lineal::Fluid>
</div>
```

Notice that when circles are too small, the text is rendered above a circle instead of within it. This is a little detail that I think goes a long way towards legibility. It's also nice that this little rendering exception is implemented in the template. Imagine your frustration if you were debugging this code and found this conditional deep in some d3 spaghetti in a backing class.

## Accessibility!

As discussed in prior dev logs, the accessibility you get for free with SVGs is much less than what you get with HTML. This is compounded when elements are positioned irrespective of their DOM order.

Let's go over a couple little things we can do with this punchcard chart to make it more screen reader friendly.

First, let's make sure our data is well-ordered. The `Lineal::Points` component will render points in the order the `@data` array is ordered. Maybe in the future something smarter can be done here, but for now this is the safest approach for Lineal to take.

If we assume a typical Western reading order of left to right and top to bottom, then what we want to do is pre-sort our data by y encoding and x encoding. But we also can't rely on the axis ticks to assist a screen reader user. A visual user will associate axis ticks with marks due to positional alignment, but that alignment isn't present in the DOM. Instead we'll mark the axes as `aria-hidden` and bake the x and y encodings into the text `aria-label`.

```hbs preview-template
<div class="demo-chart-with-axes with-left-axis">
  <Lineal::Fluid as |width height|>
    <svg class="fluid" height="300" style="overflow:visible;">
      <title>
        Some sort of property in a population broken down by age using Experian
        demographic buckets.
      </title>
      {{#let
        (scale-linear domain="0..23" range=(array 0 width))
        (scale-point domain=(data "days") range="0..300" padding=0.5)
        as |xScale yScale|
      }}
        {{#if (and xScale.isValid yScale.isValid)}}
          <Lineal::GridLines
            @scale={{yScale}}
            @direction="horizontal"
            @length={{width}}
          />
          <Lineal::GridLines
            @scale={{xScale}}
            @direction="vertical"
            @length="300"
          />
          <Lineal::Axis
            @scale={{yScale}}
            @orientation="left"
            @includeDomain={{false}}
            aria-hidden="true"
          />
          <Lineal::Axis
            @scale={{xScale}}
            @orientation="top"
            @includeDomain={{false}}
            aria-hidden="true"
          />
        {{/if}}
        <Lineal::Points
          @data={{data "activitySorted"}}
          @renderCircles={{true}}
          @x="hour"
          @y="day"
          @size="value"
          @color="day"
          @xScale={{xScale}}
          @yScale={{yScale}}
          {{! The div helper below comes from ember-math-helpers }}
          @sizeScale={{scale-sqrt
            domain="1..20"
            range=(array 2 (div width 48))
          }}
          @colorScale={{scale-ordinal
            domain=(data "days")
            range=(css-range "ordinal")
          }}
          as |points|
        >
          {{#each points as |p|}}
            <text
              class="plot-label {{if (lt p.size 12) 'plot-label--dark'}}"
              x={{p.x}}
              y={{p.y}}
              dy={{if (lt p.size 12) "-15"}}
              aria-label="{{p.datum.day}} at {{p.datum.hour}} has activity {{fmt
                p.datum.value
              }}"
            >{{fmt p.datum.value}}</text>
          {{/each}}
        </Lineal::Points>
      {{/let}}
    </svg>
  </Lineal::Fluid>
</div>
```

Compare the DOM here with the DOM above.

Thinking broader, is this actually how the chart is read by visual users? If a data visualization was nothing more than a table, why not just use a table? The whole point is by encoding various dimensions we can create something that is both understand immediately and also studied. Maybe it would actually be better to sort from largest to smallest. Maybe it's the hours with no activity that actually tell the story. A really good chart is going to be designed with some intention behind it that should be carried through implementation.

And even still, a large part of accessibility is accommodating. This is why including a table of the underlying data that can also be downloaded to be used in a tool a person may be more comfortable with is never a bad thing.

## Bonus chart

All this talk of tables and HTML makes for a good opportunity to use Lineal primitives for non-SVG visualizations. So here's the same punchcard dataset rendered as a heatmap in a basic HTML table. As a toolkit, Lineal wants to be useful in a variety of situations.

**Table**

```hbs preview-template
{{#let
  (scale-linear domain="0..20" range="0..75") (range 0 24)
  as |colorScale hours|
}}
  <table class="heatmap">
    <thead>
      <th></th>
      {{#each hours as |hour|}}
        <th class="domain">{{hour}}</th>
      {{/each}}
    </thead>
    <tbody>
      {{#each-in (group-by "day" (data "activitySorted")) as |day activity|}}
        <tr>
          <td class="domain">{{day}}</td>
          {{#each hours as |hour|}}
            {{#let (find-by "hour" hour activity) as |datum|}}
              {{#let (or datum.value 0) as |val|}}
                <td {{style --v=(str (colorScale.compute val))}}>{{fmt
                    val
                  }}</td>
              {{/let}}
            {{/let}}
          {{/each}}
        </tr>
      {{/each-in}}
    </tbody>
  </table>
{{/let}}
```

## That's all folks

Thanks for reading! Next up is pattern support (I mean it this time) and docs!
