---
title: Dev Log 01
order: 1
---

# Dev Log 01: Scales & Marks

Lineal is not a chart library. It does not provide charts, it provides the tools to build charts. The foundation of all data visualization are scales: ways to map data-space to pixel-space.

```hbs preview-template
<p>Scale Linear</p>
<svg width="800" height="6">
  {{#let (scale-linear range="15..785" domain="0..10") as |scale|}}
    {{#each (array 0 1 2 3 4 5 6 7 8 9 10) as |v|}}
      <circle cx={{scale.compute v}} cy="3" r="3"></circle>
    {{/each}}
  {{/let}}
</svg>

<p>Scale Pow (^2)</p>
<svg class="scale-pow" width="800" height="6">
  {{#let (scale-pow range="15..785" domain="0..10" exponent=2) as |scale|}}
    {{#each (array 0 1 2 3 4 5 6 7 8 9 10) as |v|}}
      <circle cx={{scale.compute v}} cy="3" r="3"></circle>
    {{/each}}
  {{/let}}
</svg>

<p>Scale Log</p>
<svg class="scale-log" width="800" height="6">
  {{#let (scale-log range="15..785" domain="1..10") as |scale|}}
    {{#each (array 1 2 3 4 5 6 7 8 9 10) as |v|}}
      <circle cx={{scale.compute v}} cy="3" r="3"></circle>
    {{/each}}
  {{/let}}
</svg>

<p>Scale Sqrt</p>
<svg class="scale-sqrt" width="800" height="6">
  {{#let (scale-sqrt range="15..785" domain="0..10") as |scale|}}
    {{#each (array 0 1 2 3 4 5 6 7 8 9 10) as |v|}}
      <circle cx={{scale.compute v}} cy="3" r="3"></circle>
    {{/each}}
  {{/let}}
</svg>

<p>Scale Symlog</p>
<svg class="scale-symlog" width="800" height="6">
  {{#let (scale-symlog range="15..785" domain="0..10") as |scale|}}
    {{#each (array 0 1 2 3 4 5 6 7 8 9 10) as |v|}}
      <circle cx={{scale.compute v}} cy="3" r="3"></circle>
    {{/each}}
  {{/let}}
</svg>
```

Once these mappings are created, we can create proportional marks. A visualization is a composition of these marks. The only difference between a mark and any ordinary graphic is the encoding of data to visual properties.

A line becomes a line chart when the `x` and `y` properties of each point in the line are mapped to an underlying dataset. In Lineal, this makes `x` and `y` Encodings.

You can think of the architecture like this:

> Marks have encodings. Encodings have scales. Scales each have a domain and a range.

Note in this example that neither the `xScale` or the `yScale` have domains. By default, Lineal marks will use the encodings to get the min and max values of a dataset for you. This process is called "qualifying" a scale. If a scale has not been qualified, it is invalid. If an invalid scale is used to compute values, an error will be thrown.

Sometimes the min and max aren't the bounds you want for a domain. For instance, when making a bar chart, the best practice is to always use `0` as the lower bound (assuming no negative values) this way the area of each bar is correctly proportional. In this case, a domain can be specified as a partial bound.

```hbs
{{#let (scale-linear range="0..100" domain="0..") as |scale|}}{{/let}}
```

Similarly, as seen with the ranges, both sides of a bounds can be specified using the string syntax. Or three or more values for a domain or scale can be specified with an array:

```hbs
{{#let (scale-linear range='0..100' domain=(array 0 100 1000) as |scale|}}
{{/let}}
```

These scale helpers use Lineal's Scale classes, which are stateful and reactive wrappers around D3 scales, which have features like piecewise interpolation built in.

Lineal takes a template-first approach to codifying this architecture, which also enables developers to create their own encapsulations of patterns using components.

Right now Lineal has three marks:

1. Line
2. Area
3. Arcs

In addition to these marks, Lineal has an Arc component that has no encodings but is still useful for generating arc-shaped SVG paths. There is no Bar component because the SVG `<rect>` element is already an abstraction for creating rectangles. Similarly there is no Circle component because SVG has `<circle>`. In the future it may make sense to create marks for `Bars` which could encode `x`, `y`, `width`, and `height`. It may also make sense to create marks for `Points` which could encode `x`, `y`, and `size`.

As it stands, with just three marks, scales, and a little bit of CSS, we can already achieve a lot.

## More Examples

A gauge chart is just a couple arcs.

```hbs preview-template
<svg width="100%" height="200" role="img" aria-label="7.2">
  <g style="transform:translate(50%, 100%)">
    <Lineal::Arc
      @startAngle="271d"
      @endAngle="450d"
      @outerRadius={{195}}
      @innerRadius={{185}}
      style="fill:var(--c-base-0)"
    />
    {{! A little ugly to use plain radians here, might be able to make it nicer later? }}
    {{#let (scale-linear domain="0..10" range="4.71..7.85") as |scale|}}
      {{log scale.range.min scale.range.max}}
      <Lineal::Arc
        @startAngle="270d"
        {{! Plain functions as helpers are only available in Ember 4.5 and later }}
        @endAngle={{scale.compute 7.2}}
        @outerRadius={{200}}
        @innerRadius={{180}}
        @cornerRadius={{10}}
        style="fill:var(--c-blue); stroke:var(--c-blue-line)"
        stroke-width="1"
      />
      <foreignObject transform="translate(-35 -100)" width="70" height="100">
        <span
          style="font-size:52px; font-weight:bold; text-align:center"
        >7.2</span>
      </foreignObject>
    {{/let}}
  </g>
</svg>
```

Donut charts can have rings if you're careful with your radii.

```hbs preview-template
<svg width="300" height="300" style="background:var(--c-base-0);" role="img">
  <title>
    Values arranged in two donuts, with the dominant data point being yellow
    with a value of 10. The sub-donut has three values with the most important
    data point valued at 2.
  </title>
  <g style="transform:translate(50%, 50%)">
    <Lineal::Arcs
      @data={{array (hash v=1) (hash v=10) (hash v=4)}}
      @theta="v"
      @colorScale="nominal"
      @padAngle="1d"
      @cornerRadius={{5}}
      @innerRadius={{50}}
      @outerRadius={{100}}
    />
    <Lineal::Arcs
      @data={{array (hash v=2) (hash v=1) (hash v=1)}}
      @theta="v"
      @colorScale="accent-green"
      @padAngle="1d"
      @cornerRadius={{5}}
      @innerRadius={{102}}
      @outerRadius={{120}}
      @startAngle="265d"
      @endAngle="360d"
    />
  </g>
</svg>
```

### Accessibility

Lineal does not address a11y best practices for you, but it also does not inhibit you from implementing them on your own. Since Lineal does not create any SVGs, developers have the capacity to make wise color choices, double-encode marks that rely on color, avoid scattered and dense plots, and use SVG best practices to ensure screen readers balance communicating the intent of charts without exhaustively narrating every datum.

In the future, Lineal will provide a11y tools just like it will provide data transformation tools and like how it currently provides data mapping and visual mark tools.

## Next Steps

Distinctly missing currently are axes, gridlines, legends, and tooltips. Most charts built with the intent of being deeply read have all these things. Without them, a reader cannot accurately map the visual to the quantitative.

These are all next on the TODO list.
