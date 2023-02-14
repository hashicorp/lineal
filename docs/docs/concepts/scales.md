---
title: Scales
order: 1
---

# Scales

Ultimately, every data visualization maps the data to be visualized to a visual mark. Those visual marks (especially in SVG) are specified with properties like `x`, and `height`, and `r`, the values of which are their own data. So in other words, at the heart of a data visualization is a process of mapping data to...different data.

Scales map **domain** data to **range** data. Or put another way, scales map data space to visual space.

```js
import { ScaleLinear } from '@lineal-viz/lineal/scale';

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

```hbs 
{{#let (scale-linear domain='1900..2023' range='30..770') as |scale|}}
  <dl>
    <dt>X</dt> <dd>{{scale.compute 1984}}</dd>
    {{!-- Or if you're on a version of Ember < 4.5 --}}
    <dt>X</dt> <dd>{{scale-fn-compute 1984}}</dd>
  </dl>
{{/let}}
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

First and foremost, Bounds can parse ranges from strings. This typically done transparently as part of declaring a scale (in fact one of the snippets above alreaady showed this).

```js
const scale = new ScaleLinear({
  domain: [0, 10],
  range: '0..100', // Gets parsed as [0, 100]
});

console.log(scale.compute(3)) // 30
```

The immediate benefit of this feature is a nice experience when using scales in templates. The `array` helper can be used to construct static arrays in templates, but it's just a bit of friction that can be smoothed over.

```hbs
{{#let (scale-linear domain=(array 0 10) range="0..100") as |scale|}}
  {{scale.compute 3}} {{! 30 }}
{{/let}}
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

Presented in an imperative form like this doesn't get the whole effect across, but the Marks concept documentation will have more examples where scales won't have to be qualified manually.

## CSS Range

It is common when visualizing data to encode discrete characteristics. This could be a color within a predefined set for an ordinal color scale, or a pattern for a partitioned map, or iconography or whatever other stylistic motifs. Typically, this is done using a scale with a discrete range (e.g., Theshold or Ordinal) to map a data value to a presentational value (color hex or class name). Lineal wants to use the platform as much as possible while also respecting the separation of concerns among document structure, behavior, and styles.

For this reason, it is a best practice to map data to discrete CSS class names so that CSS can be in control of setting styles as much as possible. Lineal has a `CSSRange` class and `css-range` helper for making this as easy as possible.

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

```hbs preview-template
<ScaleDemo
  @scale={{scale-linear domain=".."}}
  @data={{generate-linear 21 step=5 start=0}}
/>
```

### Power

```hbs preview-template
<ScaleDemo
  @scale={{scale-pow domain=".." exponent=2}}
  @data={{generate-linear 21 step=5 start=0}}
/>
```

### Logarithmic

```hbs preview-template
<ScaleDemo
  @scale={{scale-log domain=".." base=10}}
  @data={{generate-linear 21 step=5 start=1}}
/>
```

### Square Root

```hbs preview-template
<ScaleDemo
  @scale={{scale-sqrt domain=".."}}
  @data={{generate-linear 21 step=5 start=0}}
/>
```

### Symmetric Logarithmic

```hbs preview-template
<ScaleDemo
  @scale={{scale-symlog domain=".."}}
  @data={{generate-linear 21 step=5 start=-50}}
/>
```

### Radial

```hbs preview-template
<div class='demo-chart-with-axes'>
  <Lineal::Fluid as |width|>
    <svg width='100%' height='300px' style='overflow:visible'>
      <g transform='translate({{div width 2}},150)'>
        {{#let
          (scale-radial domain='..' range=(array 40 (div (min width 300) 1.5)))
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
          <Lineal::Points
            @data={{generate-linear 21 step=5 start=0}}
            @x='x'
            @xScale={{scale}}
            @y={{0}}
            @size={{3}}
          />
        {{/let}}
      </g>
    </svg>
  </Lineal::Fluid>
</div>
```

### Time

```hbs preview-template
<ScaleDemo
  @scale={{scale-time domain=(array (date "01/01/2023") (date "06/01/2023"))}}
  @data={{generate-linear-dates 21 start="01/01/2023" step=7}}
/>
```

### UTC

```hbs preview-template
<ScaleDemo
  @scale={{scale-utc domain=(array (date "01/01/2023") (date "01/07/2023"))}}
  @data={{generate-linear-dates 21 start="01/01/2023" step=0.25}} />
```

### Diverging

```hbs preview-template
{{! The color-interpolator helper is NOT in Lineal, it's here as an example }}
<DivergingScaleDemo
  @data={{generate-linear 21 step=5 start=-50}}
  @scale={{scale-diverging
    domain=(array -50 0 50)
    range=(color-interpolator 'interpolateRdBu')
  }}
/>
```

### Diverging Power

```hbs preview-template
{{! The color-interpolator helper is NOT in Lineal, it's here as an example }}
<DivergingScaleDemo
  @data={{generate-linear 21 step=5 start=-50}}
  @scale={{scale-diverging-pow
    domain=(array -50 0 50)
    range=(color-interpolator 'interpolateRdBu')
    exponent=3
  }}
/>
```

### Diverging Log

```hbs preview-template
{{! The color-interpolator helper is NOT in Lineal, it's here as an example }}
<DivergingScaleDemo
  @data={{generate-linear 21 step=50 start=0}}
  @scale={{scale-diverging-log
    domain=(array 1 250 1000)
    range=(color-interpolator 'interpolateRdBu')
    base=10
  }}
/>
```

### Diverging Square Root

```hbs preview-template
{{! The color-interpolator helper is NOT in Lineal, it's here as an example }}
<DivergingScaleDemo
  @data={{generate-linear 21 step=10 start=-100}}
  @scale={{scale-diverging-sqrt
    domain=(array -100 0 100)
    range=(color-interpolator 'interpolateRdBu')
  }}
/>
```

### Diverging Symmetric Logarithmic

```hbs preview-template
{{! The color-interpolator helper is NOT in Lineal, it's here as an example }}
<DivergingScaleDemo
  @data={{generate-linear 21 step=10 start=-100}}
  @scale={{scale-diverging-symlog
    domain=(array -100 0 100)
    range=(color-interpolator 'interpolateRdBu')
  }}
/>
```

### Quantize

```hbs preview-template
<PartitioningScaleDemo
  @data={{generate-normal 100 stddev=2 sort=true}}
  @scale={{scale-quantize domain='..' range=(css-range 'nominal') count=4}}
/>
```

### Quantile

```hbs preview-template
{{#let (generate-normal 100 stddev=2 sort=true) as |data|}}
  <PartitioningScaleDemo
    @data={{data}}
    @scale={{scale-quantile domain=(map-by 'y' data) range=(css-range 'nominal') count=4}}
  />
{{/let}}
```

### Threshold

```hbs preview-template
<PartitioningScaleDemo
  @data={{generate-normal 100 mean=75 stddev=8 sort=true}}
  @scale={{scale-threshold domain=(array 60 70 80 90) range=(css-range 'nominal')}}
/>
```

### Ordinal

```hbs preview-template
{{#let
  (scale-ordinal
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
```

### Band

```hbs preview-template
<div class='demo-chart relative-bars'>
  <Lineal::Fluid as |width|>
    {{#let (array 'A' 'B' 'C' 'D') as |data|}}
      {{#let (scale-band domain=data range=(array 0 width) padding=0.1) as |scale|}}
        {{#each data as |d|}}
          <div class='bar' {{style
            transform=(concat 'translateX(' (scale.compute d) 'px)')
            width=(concat scale.bandwidth 'px')
          }}>{{d}}</div>
        {{/each}}
      {{/let}}
    {{/let}}
  </Lineal::Fluid>
</div>
```

### Point

```hbs preview-template
<div class='demo-chart relative-points'>
  <Lineal::Fluid as |width|>
    {{#let (array 'A' 'B' 'C' 'D') as |data|}}
      {{#let (scale-point domain=data range=(array 0 width) padding=0.5) as |scale|}}
        {{#each data as |d|}}
          <div class='point' {{style
            transform=(concat 'translateX(' (scale.compute d) 'px)')
          }}>{{d}}</div>
        {{/each}}
      {{/let}}
    {{/let}}
  </Lineal::Fluid>
</div>
```

## Further reading
