---
title: Dev Log 01
---

# Dev Log 01: Scales & Marks

Lineal is not a chart library. It does not provide charts, it provides the tools to build charts. The foundation of all data visualization are scales: ways to map data-space to pixel-space.

```hbs preview-template
<p>Scale Linear</p>
<svg width='800' height='6'>
  {{#let (scale-linear range='15..785' domain='0..10') as |scale|}}
    {{#each (array 0 1 2 3 4 5 6 7 8 9 10) as |v|}}
      <circle cx={{scale.compute v}} cy='3' r='3'></circle>
    {{/each}}
  {{/let}}
</svg>

<p>Scale Pow (^2)</p>
<svg class='scale-pow' width='800' height='6'>
  {{#let (scale-pow range='15..785' domain='0..10' exponent=2) as |scale|}}
    {{#each (array 0 1 2 3 4 5 6 7 8 9 10) as |v|}}
      <circle cx={{scale.compute v}} cy='3' r='3'></circle>
    {{/each}}
  {{/let}}
</svg>

<p>Scale Log</p>
<svg class='scale-log' width='800' height='6'>
  {{#let (scale-log range='15..785' domain='1..10') as |scale|}}
    {{#each (array 1 2 3 4 5 6 7 8 9 10) as |v|}}
      <circle cx={{scale.compute v}} cy='3' r='3'></circle>
    {{/each}}
  {{/let}}
</svg>

<p>Scale Sqrt</p>
<svg class='scale-sqrt' width='800' height='6'>
  {{#let (scale-sqrt range='15..785' domain='0..10') as |scale|}}
    {{#each (array 0 1 2 3 4 5 6 7 8 9 10) as |v|}}
      <circle cx={{scale.compute v}} cy='3' r='3'></circle>
    {{/each}}
  {{/let}}
</svg>

<p>Scale Symlog</p>
<svg class='scale-symlog' width='800' height='6'>
  {{#let (scale-symlog range='15..785' domain='0..10') as |scale|}}
    {{#each (array 0 1 2 3 4 5 6 7 8 9 10) as |v|}}
      <circle cx={{scale.compute v}} cy='3' r='3'></circle>
    {{/each}}
  {{/let}}
</svg>
```

Once these mappings are created, we can create proportional marks. A visualization is a composition of these marks. The only difference between a mark and any ordinary graphic is the encoding of data to visual properties.

A line becomes a line chart when the `x` and `y` properties of each point in the line are mapped to an underlying dataset. In Lineal, this makes `x` and `y` Encodings.

```
line example
```

You can think of the architecture like this:

> Marks have encodings. Encodings have scales. Scales each have a domain and a range.

Lineal takes a template-first approach to codifying this architecture, which also enables developers to create their own encapsulations of patterns using components.

```
component example
```

Right now Lineal has three marks:

1. Line
2. Area
3. Arcs

In addition to these marks, Lineal has an Arc component that has no encodings but is still useful for generating arc-shaped SVG paths. There is no Bar component because the SVG `<rect>` element is already an abstraction for creating rectangles. Similarly there is no Circle component because SVG has `<circle>`. In the future it may make sense to create marks for `Bars` which could encode `x`, `y`, `width`, and `height`. It may also make sense to create marks for `Points` which could encode `x`, `y`, and `size`.

As it stands, with just three marks, scales, and a little bit of CSS, we can already achieve a lot.

## Example Charts

1. Line chart with points
2. Area chart with missing data & gradient background
3. Gauge chart
4. Multi-ring pie chart
5. Distribution bar, using d3.cumsum

### Accessibility

All of the above examples follow a11y best practices. They use accessible color palettes, separate marks to increase contrast, and provide descriptions that meaningfully describe the data, not just the graphic. Lineal does not provide any of this, but since Lineal also doesn't create SVGs, it isn't preventing developers from doing this work. In the future, Lineal will provide a11y tools just like it will provide data transformation tools and like how it currently provides data mapping and visual mark tools.

## Next Steps

Distinctly missing currently are axes, gridlines, legends, and tooltips. Most charts built with the intent of being deeply read have all these things. Without them, a reader cannot accurately map the visual to the quantitative.

These are all next on the TODO list. 
