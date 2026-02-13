---
title: Scales
order: 1
---

# Scales

Ultimately, every data visualization maps the data to be visualized to a visual mark. Those visual marks (especially in SVG) are specified with properties like `x`, and `height`, and `r`, the values of which are their own data. So in other words, at the heart of a data visualization is a process of mapping data to...different data.

Scales map **domain** data to **range** data. Or put another way, scales map data space to visual space.

```js
import { ScaleLinear } from '@lineal-viz/lineal/utils/scale';

// Our dataset is for birth years. We know the minimum is 1900 and the maximum
// is 2023.
const domain = [1900, 2023];

// We are going to plot these birth years on a chart that we know is 800px
// wide, plus we want to leave 30px of padding on either side.
const range = [30, 770];

// Scales are always constructed with a hash of parameters, this is for
// the most straight forward compatibility with handlebars helpers.
const scale = new ScaleLinear({ domain, range });

// Now we can map a birth year to a pixel value. (well, really an anything
// value, but presumably it's a pixel value to be used in a template)
const x = scale.compute(1984); // 535.37
```

Since this is Ember, and Lineal has a template-first design philosophy, scales are all also available as helpers.

```gts
import { scaleLinear } from '@lineal-viz/lineal/helpers';

<template>
  {{#let (scaleLinear domain='1900..2023' range='30..770') as |scale|}}
    <dl>
      <dt>X</dt> <dd>{{scale.compute 1984}}</dd>
    </dl>
  {{/let}}
</template>
```

## Similarity with D3 Scales

If you have used [D3](https://d3js.org/), this probably all looks familiar. Lineal scales are built on D3 scales, reshaped to be more ergonomic for Ember usage. The key differences are:

1. Lineal scales are classes while D3 scales are function generators.
2. Lineal takes all arguments in a hash to the constructor while D3 scales use a [fluent interface](https://en.wikipedia.org/wiki/Fluent_interface).

```js
const data = [1, 2, 3, 5, 8];

// Using D3 scales
const d3Scale = d3.scalePow()
  .domain([0, 10])
  .range([0, 250])
  .exponent(3);

console.log(data.map(d => d3Scale(d))); // [0.25, 2, 6.75, 31.25, 128]

// Using Lineal scales
const linealScale = new ScalePow({
  domain: [0, 10],
  range: [0, 250],
  exponent: 3,
});

console.log(data.map(d => linealScale.compute(d))); // [0.25, 2, 6.75, 31.25, 128]
```

These changes are rather minor, but by treating scales as objects with tracked properties, they become much easier to use in a declarative, Ember-idiomatic, way.

Lineal also introduces a new concept to scales called Bounds. Bounds are utility objects for modeling the min and max of a value range. Importantly, they can be passed around even if the min or max of the range is indeterminate. This too helps Lineal users write declarative code.

## Specifying domains and ranges with Bounds

First and foremost, Bounds can parse ranges from strings. This is typically done transparently as part of declaring a scale (in fact one of the snippets above already showed this).

```js
const scale = new ScaleLinear({
  domain: [0, 10],
  range: '0..100', // Gets parsed as [0, 100]
});

console.log(scale.compute(3)) // 30
```

The immediate benefit of this feature is a nice experience when using scales in templates. The `array` helper can be used to construct static arrays in templates, but it's just a bit of friction that can be smoothed over.

```gts
import { scaleLinear } from '@lineal-viz/lineal/helpers';
import { array } from '@ember/helper';

<template>
  {{#let (scaleLinear domain=(array 0 10) range="0..100") as |scale|}}
    {{scale.compute 3}} {{! 30 }}
  {{/let}}
</template>
```

The feature that makes Bounds especially useful when constructing declarative templates and reusable components is creating **unqualified** Bounds. A Bounds is unqualified when the min or max is indeterminate. A scale that has an unqualified Bounds for its domain or range cannot be used to compute a value until the Bounds are qualified, but being able to declare a Bounds decoupled from specifying a min or max makes decoupling data from visualization easier.

```js
const data = [ 1, 1, 2, 3, 5, 8, 13 ];

const fixed = new ScaleLinear({
  domain: [0, 10],
  range: [0, 100],
});

// Note that 130 is beyond the range because 13 is beyond the domain
console.log(data.map(d => fixed.compute(d))); // [ 10, 10, 20, 30, 50, 80, 130 ]

const dynamic = new ScaleLinear({
  domain: '0..', // min is 0, max is undefined
  range: '0..100', // shorthand for [0, 100]
});

// Until the dynamic scale is qualified, attempting to compute will error
dynamic.compute(5) // Error: Bounds have not been qualified!

// A Bounds can be qualified using a dataset and an accessor
dynamic.domain.qualify(data, d => d);

// The min, which was specified, will be preserved
console.log(dynamic.domain.bounds) // [0, 13]

// And now the scale can be used like normal
console.log(data.map(d => dynamic.compute(d))); // [7.7, 7.7, 15.4, 23.0, 38.5, 61.5, 100]
```

Presented in an imperative form like this doesn't get the whole effect across, but the [Marks concept documentation](/concepts/marks) has more examples where scales don't have to be qualified manually.

## CSS Range

It is common when visualizing data to encode discrete characteristics. This could be a color within a predefined set for an ordinal color scale, or a pattern for a partitioned map, or iconography or whatever other stylistic motifs. Typically, this is done using a scale with a discrete range (e.g., Threshold or Ordinal) to map a data value to a presentational value (color hex or class name). Lineal wants to use the platform as much as possible while also respecting the separation of concerns among document structure, behavior, and styles.

For this reason, it is a best practice to map data to discrete CSS class names so that CSS can be in control of setting styles as much as possible. Lineal has a `CSSRange` class and `cssRange` helper for making this as easy as possible.

```js
const range = new CSSRange('blues');
const classes = range.spread(3);
console.log(classes);
// [
//   'blues blues-1 blues-3-1',
//   'blues blues-2 blues-3-2',
//   'blues blues-3 blues-3-3'
// ]

const scale = new ScaleOrdinal({ range, domain: ['A', 'B', 'C', 'D'] });
console.log(scale.compute('B')); // 'blues blues-2 blues-4-2'
// Note that range.spread gets called internally in the ScaleOrdinal class with
// the appropriate count based on the length of the scale's domain.
```

## Types of scales

Lineal has a class and a helper for almost all D3 Scales.

### Linear

```gjs live preview
import { scaleLinear } from '@lineal-viz/lineal/helpers';
import generateLinear from '~docs/helpers/generate-linear';
import ScaleDemo from '~docs/components/scale-demo';

<template>
  <ScaleDemo
    @scale={{scaleLinear domain=".."}}
    @data={{generateLinear 21 step=5 start=0}}
  />
</template>
```

### Power

```gjs live preview
import { scalePow } from '@lineal-viz/lineal/helpers';
import generateLinear from '~docs/helpers/generate-linear';
import ScaleDemo from '~docs/components/scale-demo';

<template>
  <ScaleDemo
    @scale={{scalePow domain=".." exponent=2}}
    @data={{generateLinear 21 step=5 start=0}}
  />
</template>
```

### Logarithmic

```gjs live preview
import { scaleLog } from '@lineal-viz/lineal/helpers';
import generateLinear from '~docs/helpers/generate-linear';
import ScaleDemo from '~docs/components/scale-demo';

<template>
  <ScaleDemo
    @scale={{scaleLog domain=".." base=10}}
    @data={{generateLinear 21 step=5 start=1}}
  />
</template>
```

### Square Root

```gjs live preview
import { scaleSqrt } from '@lineal-viz/lineal/helpers';
import generateLinear from '~docs/helpers/generate-linear';
import ScaleDemo from '~docs/components/scale-demo';

<template>
  <ScaleDemo
    @scale={{scaleSqrt domain=".."}}
    @data={{generateLinear 21 step=5 start=0}}
  />
</template>
```

### Symmetric Logarithmic

```gjs live preview
import { scaleSymlog } from '@lineal-viz/lineal/helpers';
import generateLinear from '~docs/helpers/generate-linear';
import ScaleDemo from '~docs/components/scale-demo';

<template>
  <ScaleDemo
    @scale={{scaleSymlog domain=".."}}
    @data={{generateLinear 21 step=5 start=-50}}
  />
</template>
```

### Radial

```gjs live preview
import { scaleRadial } from '@lineal-viz/lineal/helpers';
import generateLinear from '~docs/helpers/generate-linear';
import { Fluid, Points } from '@lineal-viz/lineal/components';
import { array } from '@ember/helper';
import { div as divide, min } from '~docs/helpers/math';

<template>
  <div class='demo-chart-with-axes'>
    <Fluid as |width|>
      <svg width='100%' height='300px' style='overflow:visible'>
        <g transform='translate({{divide width 2}},150)'>
          {{#let
            (scaleRadial domain='..' range=(array 40 (divide (min width 300) 1.5)))
            as |scale|
          }}
            {{#if scale.isValid}}
              <g class='axis'>
                {{#each scale.ticks as |tick|}}
                  <circle
                    r={{scale.compute tick}}
                  ></circle>
                {{/each}}
              </g>
            {{/if}}
            <Points
              @data={{generateLinear 21 step=5 start=0}}
              @x='x'
              @xScale={{scale}}
              @y={{0}}
              @size={{3}}
            />
          {{/let}}
        </g>
      </svg>
    </Fluid>
  </div>
</template>
```

### Time

```gjs live preview
import { scaleTime } from '@lineal-viz/lineal/helpers';
import generateLinearDates from '~docs/helpers/generate-linear-dates';
import date from '~docs/helpers/date';
import ScaleDemo from '~docs/components/scale-demo';
import { array } from '@ember/helper';

<template>
  <ScaleDemo
    @scale={{scaleTime domain=(array (date "01/01/2023") (date "06/01/2023"))}}
    @data={{generateLinearDates 21 start="01/01/2023" step=7}}
  />
</template>
```

### UTC

```gjs live preview
import { scaleUtc } from '@lineal-viz/lineal/helpers';
import generateLinearDates from '~docs/helpers/generate-linear-dates';
import date from '~docs/helpers/date';
import ScaleDemo from '~docs/components/scale-demo';
import { array } from '@ember/helper';

<template>
  <ScaleDemo
    @scale={{scaleUtc domain=(array (date "01/01/2023") (date "01/07/2023"))}}
    @data={{generateLinearDates 21 start="01/01/2023" step=0.25}}
  />
</template>
```

### Diverging

```gjs live preview
import { scaleDiverging } from '@lineal-viz/lineal/helpers';
import generateLinear from '~docs/helpers/generate-linear';
import colorInterpolator from '~docs/helpers/color-interpolator';
import DivergingScaleDemo from '~docs/components/diverging-scale-demo';
import { array } from '@ember/helper';

<template>
  {{! The colorInterpolator helper is NOT in Lineal, it's here as an example }}
  <DivergingScaleDemo
    @data={{generateLinear 21 step=5 start=-50}}
    @scale={{scaleDiverging
      domain=(array -50 0 50)
      range=(colorInterpolator 'interpolateRdBu')
    }}
  />
</template>
```

### Diverging Power

```gjs live preview
import { scaleDivergingPow } from '@lineal-viz/lineal/helpers';
import generateLinear from '~docs/helpers/generate-linear';
import colorInterpolator from '~docs/helpers/color-interpolator';
import DivergingScaleDemo from '~docs/components/diverging-scale-demo';
import { array } from '@ember/helper';

<template>
  {{! The colorInterpolator helper is NOT in Lineal, it's here as an example }}
  <DivergingScaleDemo
    @data={{generateLinear 21 step=5 start=-50}}
    @scale={{scaleDivergingPow
      domain=(array -50 0 50)
      range=(colorInterpolator 'interpolateRdBu')
      exponent=3
    }}
  />
</template>
```

### Diverging Log

```gjs live preview
import { scaleDivergingLog } from '@lineal-viz/lineal/helpers';
import generateLinear from '~docs/helpers/generate-linear';
import colorInterpolator from '~docs/helpers/color-interpolator';
import DivergingScaleDemo from '~docs/components/diverging-scale-demo';
import { array } from '@ember/helper';

<template>
  {{! The colorInterpolator helper is NOT in Lineal, it's here as an example }}
  <DivergingScaleDemo
    @data={{generateLinear 21 step=50 start=0}}
    @scale={{scaleDivergingLog
      domain=(array 1 250 1000)
      range=(colorInterpolator 'interpolateRdBu')
      base=10
    }}
  />
</template>
```

### Diverging Square Root

```gjs live preview
import { scaleDivergingSqrt } from '@lineal-viz/lineal/helpers';
import generateLinear from '~docs/helpers/generate-linear';
import colorInterpolator from '~docs/helpers/color-interpolator';
import DivergingScaleDemo from '~docs/components/diverging-scale-demo';
import { array } from '@ember/helper';

<template>
  {{! The colorInterpolator helper is NOT in Lineal, it's here as an example }}
  <DivergingScaleDemo
    @data={{generateLinear 21 step=10 start=-100}}
    @scale={{scaleDivergingSqrt
      domain=(array -100 0 100)
      range=(colorInterpolator 'interpolateRdBu')
    }}
  />
</template>
```

### Diverging Symmetric Logarithmic

```gjs live preview
import { scaleDivergingSymlog } from '@lineal-viz/lineal/helpers';
import generateLinear from '~docs/helpers/generate-linear';
import colorInterpolator from '~docs/helpers/color-interpolator';
import DivergingScaleDemo from '~docs/components/diverging-scale-demo';
import { array } from '@ember/helper';

<template>
  {{! The colorInterpolator helper is NOT in Lineal, it's here as an example }}
  <DivergingScaleDemo
    @data={{generateLinear 21 step=10 start=-100}}
    @scale={{scaleDivergingSymlog
      domain=(array -100 0 100)
      range=(colorInterpolator 'interpolateRdBu')
    }}
  />
</template>
```

### Quantize

```gjs live preview
import { scaleQuantize, cssRange } from '@lineal-viz/lineal/helpers';
import generateNormal from '~docs/helpers/generate-normal';
import PartitioningScaleDemo from '~docs/components/partitioning-scale-demo';

<template>
  <PartitioningScaleDemo
    @data={{generateNormal 100 stddev=2 sort=true}}
    @scale={{scaleQuantize domain='..' range=(cssRange 'nominal') count=4}}
  />
</template>
```

### Quantile

```gjs live preview
import { scaleQuantile, cssRange } from '@lineal-viz/lineal/helpers';
import generateNormal from '~docs/helpers/generate-normal';
import PartitioningScaleDemo from '~docs/components/partitioning-scale-demo';
import { mapBy } from '~docs/helpers/collection';

<template>
  {{#let (generateNormal 100 stddev=2 sort=true) as |data|}}
    <PartitioningScaleDemo
      @data={{data}}
      @scale={{scaleQuantile domain=(mapBy 'y' data) range=(cssRange 'nominal') count=4}}
    />
  {{/let}}
</template>
```

### Threshold

```gjs live preview
import { scaleThreshold, cssRange } from '@lineal-viz/lineal/helpers';
import generateNormal from '~docs/helpers/generate-normal';
import PartitioningScaleDemo from '~docs/components/partitioning-scale-demo';
import { array } from '@ember/helper';

<template>
  <PartitioningScaleDemo
    @data={{generateNormal 100 mean=75 stddev=8 sort=true}}
    @scale={{scaleThreshold domain=(array 60 70 80 90) range=(cssRange 'nominal')}}
  />
</template>
```

### Ordinal

```gjs live preview
import { scaleOrdinal } from '@lineal-viz/lineal/helpers';
import { array } from '@ember/helper';

<template>
  {{#let
    (scaleOrdinal
      domain=(array 'apple' 'grapes' 'banana')
      range=(array 'fruit-apple' 'fruit-grapes' 'fruit-banana')
    ) as |scale|
  }}
    <ol class='fruit-list'>
      {{#each (array 'apple' 'grapes' 'apple' 'apple' 'banana' 'banana' 'grapes') as |fruit|}}
        <li class='{{scale.compute fruit}}'>{{fruit}}</li>
      {{/each}}
    </ol>
  {{/let}}
</template>
```

### Band

```gjs live preview
import { scaleBand } from '@lineal-viz/lineal/helpers';
import { Fluid } from '@lineal-viz/lineal/components';
import { array, concat } from '@ember/helper';

<template>
  <div class='demo-chart relative-bars'>
    <Fluid as |width|>
      {{#let (array 'A' 'B' 'C' 'D') as |data|}}
        {{#let (scaleBand domain=data range=(array 0 width) padding=0.1) as |scale|}}
          {{#each data as |d|}}
            <div
              class='bar'
              style={{concat
                "transform:translateX(" (scale.compute d) "px);"
                "width:" scale.bandwidth "px"
              }}
            >{{d}}</div>
          {{/each}}
        {{/let}}
      {{/let}}
    </Fluid>
  </div>
</template>
```

### Point

```gjs live preview
import { scalePoint } from '@lineal-viz/lineal/helpers';
import { Fluid } from '@lineal-viz/lineal/components';
import { array, concat } from '@ember/helper';

<template>
  <div class='demo-chart relative-points'>
    <Fluid as |width|>
      {{#let (array 'A' 'B' 'C' 'D') as |data|}}
        {{#let (scalePoint domain=data range=(array 0 width) padding=0.5) as |scale|}}
          {{#each data as |d|}}
            <div
              class='point'
              style={{concat "transform:translateX(" (scale.compute d) "px)"}}
            >{{d}}</div>
          {{/each}}
        {{/let}}
      {{/let}}
    </Fluid>
  </div>
</template>
```
