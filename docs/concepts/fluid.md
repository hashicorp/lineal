---
title: Fluid
order: 4
---

# Fluid

Charts on the web need to adapt to their container size. While CSS can handle layout, SVG elements require explicit pixel dimensions for scales and visual encodings. `Lineal::Fluid` bridges this gap by using a `ResizeObserver` to track container dimensions and yield them to child components.

## Basic Usage

Wrap your chart in `Fluid` to get responsive dimensions:

```gjs live preview
import { Fluid } from '@lineal-viz/lineal/components';
import { scaleLinear } from '@lineal-viz/lineal/helpers';
import { array } from '@ember/helper';

<template>
  <div style="width:100%;">
    <Fluid as |width|>
      <svg width={{width}} height="80" style="display:block;">
        {{#let
          (scaleLinear domain="0..100" range=(array 0 width))
          as |xScale|
        }}
          <rect x="0" y="0" width={{width}} height="80" fill="none" stroke="currentColor" stroke-dasharray="4 4" rx="4" />
          <text x={{xScale.compute 50}} y="44" text-anchor="middle" fill="currentColor" font-size="14">
            Container width: {{width}}px
          </text>
        {{/let}}
      </svg>
    </Fluid>
  </div>
</template>
```

The component yields three values:

- `width` - The current width in pixels
- `height` - The current height in pixels
- `entry` - The raw `ResizeObserverEntry` for advanced use cases

## Styling

Style the container element (not Fluid itself) to control the chart dimensions:

```css
.chart-container {
  width: 100%;
  height: 300px;
  /* Or use flexbox, grid, vh units, etc. */
}
```

The `Fluid` component renders a `<div class="lineal-fluid">` that fills its container and reports dimensions.

## Using Scales with Mark Components

When combining `Fluid` with Mark components (`Line`, `Area`, `Arc`, `Bars`, etc.), there's an important pattern to follow to avoid rendering issues.

### The Problem

Scale helpers like `scaleLinear` create a **new scale instance on every render**. Mark components call an internal `qualifyScale()` function that schedules domain updates. When Fluid updates dimensions → scales recreate → marks update domains → triggers re-render → Fluid updates → infinite loop.

### The Solution: Cached Scales with `.derive()`

Define your scales as `@cached` class properties, then use `.derive()` inside the Fluid block to create range-specific variants:

```gts
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { ScaleLinear } from '@lineal-viz/lineal/utils/scale';
import { extent } from 'd3-array';
import { Fluid, Line } from '@lineal-viz/lineal/components';
import { array } from '@ember/helper';

export default class MyChart extends Component {
  get data() {
    return this.args.data ?? [];
  }

  @cached
  get xScale() {
    return new ScaleLinear({
      domain: extent(this.data, (d) => d.x),
    });
  }

  @cached
  get yScale() {
    return new ScaleLinear({
      domain: extent(this.data, (d) => d.y),
    });
  }

  <template>
    <Fluid as |width height|>
      <svg>
        {{#let
          (this.xScale.derive range=(array 0 width))
          (this.yScale.derive range=(array height 0))
          as |xScale yScale|
        }}
          <Line
            @data={{this.data}}
            @xScale={{xScale}}
            @yScale={{yScale}}
            @x="x"
            @y="y"
          />
        {{/let}}
      </svg>
    </Fluid>
  </template>
}
```

### Why This Works

- `@cached` ensures the base scale instance is stable across renders
- `.derive()` creates a new scale with the updated range but shares the domain
- Mark components can safely call `qualifyScale()` without triggering infinite loops

### When Scale Helpers Are Safe

Scale helpers (`scaleLinear`, `scaleTime`, etc.) are perfectly fine to use:

- With fixed dimensions (not inside Fluid)
- Inside Fluid when only using simple elements like `<circle>` or `<rect>` (not Mark components)
- When scales have static domains that don't need qualification

```gts
import { Fluid, Line } from '@lineal-viz/lineal/components';
import { scaleLinear } from '@lineal-viz/lineal/helpers';
import { array } from '@ember/helper';

<template>
  {{! This is fine - fixed dimensions }}
  <svg width="800" height="400">
    {{#let (scaleLinear domain="0..100" range="0..800") as |xScale|}}
      <Line @xScale={{xScale}} ... />
    {{/let}}
  </svg>

  {{! This is fine - no Mark components }}
  <Fluid as |width height|>
    <svg>
      {{#let (scaleLinear domain="0..100" range=(array 0 width)) as |xScale|}}
        {{#each this.data as |d|}}
          <circle cx={{xScale.compute d.x}} cy="50" r="5" />
        {{/each}}
      {{/let}}
    </svg>
  </Fluid>
</template>
```

## Complete Example

Here's a complete responsive line chart with proper scale handling:

```gts
import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { ScaleLinear } from '@lineal-viz/lineal/utils/scale';
import { extent } from 'd3-array';
import { Fluid, Axis, GridLines, Line } from '@lineal-viz/lineal/components';
import { interactorCartesianHorizontal } from '@lineal-viz/lineal/modifiers';
import { array } from '@ember/helper';
import { and } from '~docs/helpers/truth-helpers';

interface ChartSignature {
  Args: { data: Array<{ x: number; y: number }> };
}

export default class ResponsiveLineChart extends Component<ChartSignature> {
  @tracked activeDatum: { x: number; y: number } | null = null;

  @cached
  get xScale() {
    return new ScaleLinear({
      domain: extent(this.args.data, (d) => d.x),
    });
  }

  @cached
  get yScale() {
    return new ScaleLinear({
      domain: extent(this.args.data, (d) => d.y),
    });
  }

  updateActive = (data: any) => {
    this.activeDatum = data?.datum?.datum ?? null;
  };

  <template>
    <div class="chart-container">
      <Fluid as |width height|>
        <svg class="chart-svg">
          {{#let
            (this.xScale.derive range=(array 0 width))
            (this.yScale.derive range=(array height 0))
            as |xScale yScale|
          }}
            {{#if (and xScale.isValid yScale.isValid)}}
              <Axis @scale={{yScale}} @orientation="left" />
              <Axis
                @scale={{xScale}}
                @orientation="bottom"
                transform="translate(0,{{height}})"
              />
              <GridLines
                @scale={{yScale}}
                @direction="horizontal"
                @length={{width}}
              />
            {{/if}}

            <Line
              @data={{@data}}
              @xScale={{xScale}}
              @yScale={{yScale}}
              @x='x'
              @y='y'
              stroke='currentColor'
              stroke-width='2'
              fill='none'
            />

            <rect
              x="0"
              y="0"
              width={{width}}
              height={{height}}
              fill="transparent"
              {{interactorCartesianHorizontal
                data=@data
                xScale=xScale
                x="x"
                onSeek=this.updateActive
              }}
            />
          {{/let}}
        </svg>
      </Fluid>
    </div>
  </template>
}
```
