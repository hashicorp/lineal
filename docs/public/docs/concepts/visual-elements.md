---
title: Visual Elements
order: 3
---

# Visual Elements

Data visualizations are composed of visual elements beyond marks. Lineal has components for common non-mark visual elements too.

## Axes

Without axes, charts can only be read as a mood (data art) or by people steeped in their data domain (sparklines). Axes are also tricky to get right and are somewhat a function of a scale.

Lineal's axis component (by wrapping D3 scales) provide automatic tick and label generation while deferring style and positioning to CSS. Importantly, Lineal's axis component does not wrap D3 axis. It is a native Glimmer component that uses a D3 scale as a data source just like the D3 access component does. This way all DOM creation and manipulation remains within the Glimmer VM.

```hbs preview-template
<div class="demo-chart-with-axes">
  <Lineal::Fluid as |width|>
    {{#let
      (scale-linear domain="0..100" range=(array 0 width))
      (scale-pow domain="0..10000" range="400..0" exponent=2 nice=true)
      as |xScale yScale|
    }}
      <svg width="100%" height="400px">
        <Lineal::Axis
          @orientation="bottom"
          @scale={{xScale}}
          transform="translate(0,400)"
        />
        <Lineal::Axis
          @orientation="left"
          @scale={{yScale}}
          @tickValues={{array 0 2500 5000 7500 10000}}
        />
      </svg>
    {{/let}}
  </Lineal::Fluid>
</div>
```

## GridLines

GridLines, like axes, help a viewer interpret a visualization. When using D3 directly, gridlines are typically drawn using `d3.axis` with a trick to make tick lengths the width or height of a plot in the opposite direction a tick would normally be drawn.

Since gridlines are so common, Lineal has a first-class gridlines component so no tricks are needed. Just like the Lineal axis component, the Lineal gridlines component is built with Glimmer.

```hbs preview-template
<div class="demo-chart-with-axes">
  <Lineal::Fluid as |width|>
    {{#let
      (scale-linear domain="0..100" range=(array 0 width))
      (scale-pow domain="0..10000" range="400..0" exponent=2 nice=true)
      as |xScale yScale|
    }}
      <svg width="100%" height="400px">
        <Lineal::GridLines
          @direction="horizontal"
          @scale={{yScale}}
          @length={{width}}
          @lineValues={{array 0 1250 2500 3750 5000 6250 7500 8750 10000}}
        />
        <Lineal::GridLines
          @direction="vertical"
          @scale={{xScale}}
          @length={{400}}
        />
        <Lineal::Axis
          @orientation="bottom"
          @scale={{xScale}}
          transform="translate(0,400)"
        />
        <Lineal::Axis
          @orientation="left"
          @scale={{yScale}}
          @tickValues={{array 0 2500 5000 7500 10000}}
        />
      </svg>
    {{/let}}
  </Lineal::Fluid>
</div>
```
