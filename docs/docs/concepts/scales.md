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

## Types of scales

```hbs preview-template
<ScaleDemo
  @scale={{scale-linear domain=".."}}
  @data={{generate-linear 21 step=5 start=0}}
/>
```

## CSS Range

## Further reading
