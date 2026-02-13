---
title: Dev Log 01
order: 1
---

# Dev Log 01: Scales & Marks

Lineal is not a chart library. It does not provide charts, it provides the tools to build charts. The foundation of all data visualization are scales: ways to map data-space to pixel-space.

```gjs live preview
import { scaleLinear, scalePow, scaleLog, scaleSqrt, scaleSymlog } from '@lineal-viz/lineal/helpers';
import { Fluid } from '@lineal-viz/lineal/components';
import { array } from '@ember/helper';
import { sub } from '~docs/helpers/math';

<template>
  <div class="demo-chart">
    <Fluid as |width|>
      {{#let (array 0 1 2 3 4 5 6 7 8 9 10) as |values|}}
        <p>Scale Linear</p>
        <svg width='100%' height='6'>
          {{#let (scaleLinear range=(array 15 (sub width 15)) domain='0..10') as |scale|}}
            {{#each values as |v|}}
              <circle cx={{scale.compute v}} cy='3' r='3'></circle>
            {{/each}}
          {{/let}}
        </svg>

        <p>Scale Pow (^2)</p>
        <svg width='100%' height='6'>
          {{#let (scalePow range=(array 15 (sub width 15)) domain='0..10' exponent=2) as |scale|}}
            {{#each values as |v|}}
              <circle cx={{scale.compute v}} cy='3' r='3'></circle>
            {{/each}}
          {{/let}}
        </svg>

        <p>Scale Log</p>
        <svg width='100%' height='6'>
          {{#let (scaleLog range=(array 15 (sub width 15)) domain='1..10') as |scale|}}
            {{#each (array 1 2 3 4 5 6 7 8 9 10) as |v|}}
              <circle cx={{scale.compute v}} cy='3' r='3'></circle>
            {{/each}}
          {{/let}}
        </svg>

        <p>Scale Sqrt</p>
        <svg width='100%' height='6'>
          {{#let (scaleSqrt range=(array 15 (sub width 15)) domain='0..10') as |scale|}}
            {{#each values as |v|}}
              <circle cx={{scale.compute v}} cy='3' r='3'></circle>
            {{/each}}
          {{/let}}
        </svg>

        <p>Scale Symlog</p>
        <svg width='100%' height='6'>
          {{#let (scaleSymlog range=(array 15 (sub width 15)) domain='0..10') as |scale|}}
            {{#each values as |v|}}
              <circle cx={{scale.compute v}} cy='3' r='3'></circle>
            {{/each}}
          {{/let}}
        </svg>
      {{/let}}
    </Fluid>
  </div>
</template>
```

Once these mappings are created, we can create proportional marks. A visualization is a composition of these marks. The only difference between a mark and any ordinary graphic is the encoding of data to visual properties.

A line becomes a line chart when the `x` and `y` properties of each point in the line are mapped to an underlying dataset. In Lineal, this makes `x` and `y` Encodings.

You can think of the architecture like this:

> Marks have encodings. Encodings have scales. Scales each have a domain and a range.

Note in this example that neither the `xScale` or the `yScale` have domains. By default, Lineal marks will use the encodings to get the min and max values of a dataset for you. This process is called "qualifying" a scale. If a scale has not been qualified, it is invalid. If an invalid scale is used to compute values, an error will be thrown.

Sometimes the min and max aren't the bounds you want for a domain. For instance, when making a bar chart, the best practice is to always use `0` as the lower bound (assuming no negative values) this way the area of each bar is correctly proportional. In this case, a domain can be specified as a partial bound.

```gjs
<template>
  {{#let (scaleLinear range='0..100' domain='0..') as |scale|}}
  {{/let}}
</template>
```

Similarly, as seen with the ranges, both sides of a bounds can be specified using the string syntax. Or three or more values for a domain or scale can be specified with an array:

```gjs
<template>
  {{#let (scaleLinear range='0..100' domain=(array 0 100 1000)) as |scale|}}
  {{/let}}
</template>
```

These scale helpers use Lineal's Scale classes, which are stateful and reactive wrappers around D3 scales, which have features like piecewise interpolation built in.

Lineal takes a template-first approach to codifying this architecture, which also enables developers to create their own encapsulations of patterns using components.

Right now Lineal has three marks:

1. Line
2. Area
3. Arcs

In addition to these marks, Lineal has an Arc component that has no encodings but is still useful for generating arc-shaped SVG paths. Since this dev log was written, Lineal has added `Bars`, `VBars`, `HBars`, and `Points` marks in [Dev Log 04](/dev-logs/four).

With marks, scales, and a little bit of CSS, we can already achieve a lot.

## More Examples

A gauge chart is just a couple arcs.

```gjs live preview
import { Arc } from '@lineal-viz/lineal/components';
import { scaleLinear } from '@lineal-viz/lineal/helpers';

<template>
  <svg viewBox='-135 -130 270 175' width='300' role='img' aria-label="7.2" style='display:block; margin:auto;'>
    <Arc
      @startAngle='271d'
      @endAngle='450d'
      @outerRadius={{120}}
      @innerRadius={{112}}
      style="fill:var(--c-base-0)"
    />
    {{#let (scaleLinear domain="0..10" range="4.71..7.85") as |scale|}}
      <Arc
        @startAngle='270d'
        @endAngle={{scale.compute 7.2}}
        @outerRadius={{125}}
        @innerRadius={{108}}
        @cornerRadius={{8}}
        style="fill:var(--c-blue); stroke:var(--c-blue-line)"
        stroke-width='1'
      />
      <text x='0' y='-20' text-anchor='middle' fill='currentColor' font-size='36' font-weight='bold'>7.2</text>
    {{/let}}
  </svg>
</template>
```

Donut charts can have rings if you're careful with your radii.

```gjs live preview
import { Arcs } from '@lineal-viz/lineal/components';
import { array, hash } from '@ember/helper';

<template>
  <svg viewBox='-130 -130 260 260' width='260' style='display:block; margin:auto; background:var(--c-base-0); border-radius:8px;' role='img'>
    <title>
      Values arranged in two donuts, with the dominant data point being
      yellow with a value of 10. The sub-donut has three values with the
      most important data point valued at 2.
    </title>
    <g>
      <Arcs
        @data={{array (hash v=1) (hash v=10) (hash v=4)}}
        @theta='v'
        @colorScale='nominal'
        @padAngle='1d'
        @cornerRadius={{5}}
        @innerRadius={{50}}
        @outerRadius={{100}}
      />
      <Arcs
        @data={{array (hash v=2) (hash v=1) (hash v=1)}}
        @theta='v'
        @colorScale='accent-green'
        @padAngle='1d'
        @cornerRadius={{5}}
        @innerRadius={{102}}
        @outerRadius={{120}}
        @startAngle='265d'
        @endAngle='360d'
      />
    </g>
  </svg>
</template>
```

### Accessibility

Lineal does not address a11y best practices for you, but it also does not inhibit you from implementing them on your own. Since Lineal does not create any SVGs, developers have the capacity to make wise color choices, double-encode marks that rely on color, avoid scattered and dense plots, and use SVG best practices to ensure screen readers balance communicating the intent of charts without exhaustively narrating every datum.

In the future, Lineal will provide a11y tools just like it will provide data transformation tools and like how it currently provides data mapping and visual mark tools.

## Next Steps

Since this initial dev log, Lineal has added axes, gridlines, bars, points, and more. Read on through the [subsequent dev logs](/dev-logs/two) and [concept docs](/concepts/scales) to learn about these features.
