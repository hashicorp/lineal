---
title: Marks
order: 2
---

# Marks

Once data has been mapped to visual space using [scales](/docs/concepts/scales), the data needs to be visually presented. These presentational elements are called marks.

Sometimes it is simple enough to create these presentational elements on your own. After all, scales can compute values and those values can be bound to attributes using Handlebars.

```hbs preview-template
{{#let
  (scale-linear domain="0..50" range="15..485")
  (scale-linear domain="10..-10" range="15..135")
  (generate-sine 51)
  as |xScale yScale data|
}}
  <svg width="500" height="150">
    {{#each data as |d|}}
      <circle
        cx={{xScale.compute d.x}}
        cy={{yScale.compute d.y}}
        r="3"
      ></circle>
    {{/each}}
  </svg>
{{/let}}
```

Other times, the mark we want to make isn't as simple as binding data, a transformation of some sort is needed first. That transformation can be tucked within a Mark component.

```hbs preview-template
{{#let
  (scale-linear domain="0..50" range="15..485")
  (scale-linear domain="10..-10" range="15..135")
  (generate-sine 51)
  as |xScale yScale data|
}}
  <svg width="500" height="150">
    <Lineal::Line
      @data={{data}}
      @x="x"
      @y="y"
      @xScale={{xScale}}
      @yScale={{yScale}}
      stroke="black"
      stroke-width="2"
      fill="none"
    />
    {{#each data as |d|}}
      <circle
        cx={{xScale.compute d.x}}
        cy={{yScale.compute d.y}}
        r="3"
      ></circle>
    {{/each}}
  </svg>
{{/let}}
```

Additionally, sometimes marks have their own properties that aren't derived from data. Like the way a line is drawn through points.

```hbs preview-template
{{#let
  (scale-linear domain="0..50" range="15..485")
  (scale-linear domain="10..-10" range="15..135")
  (generate-sine 51)
  as |xScale yScale data|
}}
  <svg width="500" height="150">
    <Lineal::Line
      @data={{data}}
      @x="x"
      @y="y"
      @xScale={{xScale}}
      @yScale={{yScale}}
      @curve="natural"
      stroke="black"
      stroke-width="2"
      fill="none"
    />
    {{#each data as |d|}}
      <circle
        cx={{xScale.compute d.x}}
        cy={{yScale.compute d.y}}
        r="3"
      ></circle>
    {{/each}}
  </svg>
{{/let}}
```

And, much like with any component, sometimes having a Mark is useful just because it's nice to abstract repetitive code.

```hbs preview-template
{{#let
  (scale-linear domain="0..50" range="15..485")
  (scale-linear domain="10..-10" range="15..135")
  (generate-sine 51)
  as |xScale yScale data|
}}
  <svg width="500" height="150">
    <Lineal::Line
      @data={{data}}
      @x="x"
      @y="y"
      @xScale={{xScale}}
      @yScale={{yScale}}
      @curve="natural"
      stroke="black"
      stroke-width="2"
      fill="none"
    />
    <Lineal::Points
      @data={{data}}
      @x="x"
      @y="y"
      @xScale={{xScale}}
      @yScale={{yScale}}
      @size={{3}}
    />
  </svg>
{{/let}}
```

Additionally, keeping the level of abstraction at Marks and not something higher level, like a chart type, means composing marks into richer visualizations comes naturally rather than being a battle against the toolkit or framework.

```hbs preview-template
{{#let
  (scale-linear domain="0..50" range="15..485")
  (scale-linear domain="10..-10" range="15..135")
  (generate-sine 51)
  as |xScale yScale data|
}}
  <svg width="500" height="150">
    <Lineal::Line
      @data={{data}}
      @x="x"
      @y="y"
      @xScale={{xScale}}
      @yScale={{yScale}}
      @curve="natural"
      stroke="black"
      stroke-width="2"
      fill="none"
    />
    <Lineal::Points
      @data={{data}}
      @x="x"
      @y="y"
      @xScale={{xScale}}
      @yScale={{yScale}}
      @size={{3}}
    />
    {{#let
      (scale-band domain=(map-by "x" data) range="15..485" paddingInner=0.1)
      (scale-linear range="135..15" domain="10..-10")
      as |bScale byScale|
    }}
      <Lineal::Bars
        @data={{data}}
        @x="x"
        @y="y"
        @height="y"
        @width={{bScale.bandwidth}}
        @xScale={{bScale}}
        @yScale={{yScale}}
        @heightScale={{byScale}}
        opacity="0.3"
      />
    {{/let}}
  </svg>
{{/let}}
```

## Anatomy of a Mark

Marks are always Glimmer components that have [Scales](/docs/concepts/scales) and Encodings as arguments. Scales map data space to visual space, and Encodings are properties of a Mark that can be determined by data. As an example, the `Lineal::Line` mark has `@x` and `@y` encodings, which respectively encode the x and y coordinates of each point in the drawn line.

Encoding arguments can be one of a `number`, a `string`, or a `function`, which is converted into an Accessor, which is a function that takes a datum and returns a value.

1. When the Encoding is a `number`, the Accessor is static: `@x={{12}} -> () => 12`.
2. When the Encoding is a `string`, the Accessor is a field lookup: `@x='foo' -> (d) => d['foo']`.
3. When the Encoding is a `function`, the Accessor is the provided function: `@x={{this.fn}} -> (d) => this.fn(d)`

Once an Accessor has looked up a value, that value is then passed into the corresponding `scale.compute` function.

In the above example, circles were originally drawn using an `each` loop:

```hbs
{{#each data as |d|}}
  <circle cx={{xScale.compute d.x}} cy={{yScale.compute d.y}} r="3"></circle>
{{/each}}
```

When this code is refactored to use the `Lineal::Points` mark, the values for `cx` and `cy` are instead determined by the combination of `@x` and `@y` Encodings and `@xScale` and `@yScale` Scales. Additionally, the `@size` Encoding (which determines the value for `r`) is set to a fixed value of `3` which makes providing a value for `@sizeScale` unnecessary.

```hbs
<Lineal::Points
  @data={{data}}
  @x="x"
  @y="y"
  @xScale={{xScale}}
  @yScale={{yScale}}
  @size={{3}}
/>
```

Usually this process of setting up scales and declaring encodings is all in pursuit of a visual artifact. For instance, this is the entire template for `Lineal::Line`:

```hbs
<path d={{this.d}} ...attributes></path>
```

All of the value of this component comes from:

1. Transforming the original dataset into the SVG path syntax while also translating data values from data space to visual space.
2. Conforming to a consistent pattern of Encodings and Scales for creating visual artifacts.

For some marks, there is value in just the translating data values from data space to visual space. In these cases, a Mark may yield the transformed dataset for a Mark consumer to use while constructing their own markup.

Here is an example of using `Lineal::Points` to render text.

```hbs preview-template
{{#let
  (scale-linear domain="0..50" range="15..485")
  (scale-linear domain="10..-10" range="15..135")
  (generate-sine 51)
  as |xScale yScale data|
}}
  <svg
    width="500"
    height="150"
    role="img"
    aria-label="a sine curve with increasing magnitude"
    style="margin:30px; overflow:visible"
  >
    <Lineal::Line
      @data={{data}}
      @x="x"
      @y="y"
      @xScale={{xScale}}
      @yScale={{yScale}}
      @curve="natural"
      stroke="black"
      stroke-width="2"
      fill="none"
    />
    <Lineal::Points
      @data={{data}}
      @x="x"
      @y="y"
      @xScale={{xScale}}
      @yScale={{yScale}}
      @size={{3}}
      @renderCircles={{true}}
      as |points|
    >
      {{#each points as |p|}}
        {{#if (eq (mod p.datum.x 3) 0)}}
          <g transform="translate({{p.x}},{{p.y}})">
            <text
              dy={{if (lt p.datum.y 0) 35 -35}}
              dominant-baseline="middle"
              text-anchor="middle"
            >{{fmt p.datum.y}}</text>
            <line
              y2={{if (lt p.datum.y 0) 20 -20}}
              stroke-width="2"
              stroke="black"
              opacity="0.3"
            />
          </g>
        {{/if}}
      {{/each}}
    </Lineal::Points>
  </svg>
{{/let}}
```

## Automatic scale qualification

All of the above examples use scales with predefined domains for the sake of simplicity. However, in practice, domains are often derived from the dataset being visualized. The typical pattern in D3 uses the `extent` function from `d3-array` and resembles this:

```js
const data = [
  { year: 2010, revenue: 1_000_000 },
  { year: 2011, revenue: 1_500_000 },
  { year: 2012, revenue: 1_900_000 },
  { year: 2013, revenue: 2_700_000 },
  { year: 2014, revenue: 3_300_000 },
  { year: 2015, revenue: 4_000_000 },
  { year: 2016, revenue: 5_000_000 },
  { year: 2017, revenue: 8_000_000 },
  { year: 2018, revenue: 12_000_000 },
  { year: 2019, revenue: 19_000_000 },
  { year: 2020, revenue: 10_000_000 },
  { year: 2021, revenue: 12_000_000 },
  { year: 2022, revenue: 15_000_000 },
];

const [min, max] = d3.extent(data, (d) => d.revenue);
const yScale = d3.scaleLinear().domain([min, max]);
```

This process of using `extent` to get the min/max of a dataset based on an accessor before then usin the min/max to create a scale is a great pattern, but it is also an imperative pattern. To make this declarative, Lineal supports [unqualified scales](/docs/concepts/scales#specifying-domains-and-ranges-with-bounds) that describe a scale that is missing a min or max value for a domain or range.

Then a Mark accepts encodings and data that describe how a mark should be constructed. Using the data, the scale, and the encoding, Mark components will automatically compute the extent of a dataset and update the scale's domain to now be qualified.

```hbs preview-template
<div class="demo-chart-with-axes">
  {{#let
    (array
      (hash year=2010 revenue=1000000)
      (hash year=2011 revenue=1500000)
      (hash year=2012 revenue=1900000)
      (hash year=2013 revenue=2700000)
      (hash year=2014 revenue=3300000)
      (hash year=2015 revenue=4000000)
      (hash year=2016 revenue=5000000)
      (hash year=2017 revenue=8000000)
      (hash year=2018 revenue=12000000)
      (hash year=2019 revenue=19000000)
      (hash year=2020 revenue=10000000)
      (hash year=2021 revenue=12000000)
      (hash year=2022 revenue=15000000)
    )
    as |data|
  }}
    {{#let
      (scale-linear domain=".." range="0..500")
      (scale-linear domain="0.." range="150..0")
      as |xScale yScale|
    }}
      <svg
        width="500"
        height="150"
        role="img"
        aria-label="revenue from 2010 to 2022 with a peak in 2019 and a dip in 2020"
        style="margin:0"
      >
        {{#if (and xScale.isValid yScale.isValid)}}
          <Lineal::Axis
            @scale={{xScale}}
            @orientation="bottom"
            transform="translate(0,150)"
            as |tick|
          >
            <line stroke="currentColor" y2={{tick.size}}></line>
            <text y={{tick.offset}} dy={{tick.textOffset}} text-anchor="middle">
              {{tick.value}}
            </text>
          </Lineal::Axis>
          <Lineal::Axis
            @scale={{yScale}}
            @orientation="right"
            transform="translate(500,0)"
          />
        {{/if}}
        <Lineal::Line
          @data={{data}}
          @x="year"
          @y="revenue"
          @xScale={{xScale}}
          @yScale={{yScale}}
          stroke="black"
          stroke-width="2"
          fill="none"
        />
      </svg>
    {{/let}}
  {{/let}}
</div>
```

In this example, the x scale's domain is declared without a min or max using the Bounds syntax `'..'` while the y scale's domain is declared with a min but no max (`'0..'`).

The `Lineal::Axis` component expects scales to be qualified so they are conditionally rendered based on whether or not these scales are qualified.

Lastly, the `Lineal::Line` component uses the x and y scales while also declaring encodings and a dataset. With all this information, the `Lineal::Line` Mark can qualify the scales and then proceed to render a line. Now that the scales have been qualified, the two Axis components will render.

Note that this process takes two renders to complete, this is because Tracked Properties can't be updated twice in the same render loop.

## Marks in practice

Using Mark component should feel like using any other Ember components, and the same component design principles still apply. It is normal to use Marks as one-offs to create bespoke visualizations, and it is also normal to create higher-level components consisting of Marks to achieve consistent designs and repeatable patterns.
