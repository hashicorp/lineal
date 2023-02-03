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

## Specifying domains and ranges with Bounds

## Types of scales

## Further reading
