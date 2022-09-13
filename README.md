# Lineal

Lineal is a template-first data visualization toolkit for Ember. Instead of offering components for common chart types, Lineal offers components for assembling any visualization based on a grammar of graphics, including marks, encodings, scales, and transforms.

## Compatibility

* Ember.js v3.24 or above
* Embroider or ember-auto-import v2

## Usage

Making your first chart:

### 1. Create scales for your data

Lineal exports a suite of helpers for constructing scales using `d3-scale`.

```hbs
{{let (scale-linear range=(array 0 500) domain="1..100") as |scale|}}
  {{log scale.range.min scale.range.max}}
  {{log scale.domain.min scale.domain.max}}
{{let}}
```

All scales have a **domain** and a **range**. The domain represents the bounds of the data to visualize. The range represents the bounds of the pixel-space to visualize onto. Once constructed, scales are then used to translate values from data-space to pixel-space. On their own, scales aren't too exciting, but they are the foundation of visually displaying quantitative information.

### 2. Create visual marks using your scales

Lineal exports a suite of visual primitives called "marks". Sometimes these are as simple as sugar on top of SVG elements such as `rect` and `circle`, other times they are powerful abstractions over multiple SVG elements with complex attributes.

```js
export class Chart extends Component {
  data = [
    { time: '2022-1-1', value: 13 },
    { time: '2022-2-1', value: 21 },
    { time: '2022-3-1', value: 34 },
  ]
}
```

```hbs
{{let (scale-linear range=(array 0 500)) as |scale|}}
  <Lineal::Line @data={{this.data}} @x="time" @y="value" @yScale={{scale}} />
{{let}}
```

Here `Lineal::Line` represents a line, like you'd see in a line chart. First, it receives a `@data` arg from our context. Then it receives two args, `@x` and `@y` which here are strings. Lastly, we provide `@yScale` to be the scale we defined before.

The quick observer may have noticed that our scale definition has changed. Our `scale-linear` now no longer provides a domain! This is because scales can be partially constructed. When `Lineal::Line` goes to render the line, it first examines the `yScale` and infers that the domain is undefined. Instead of erroring, it will default to using the extent of the provided data using the encoding provided in the `@y` arg. In this case, `@y` specifies "value", and for our dataset the domain of values for the "value" field is `[13, 34]`. This is the power of encodings.

Encodings are predefined geometric attributes on visual marks that can be used to map data values to geometric values. `Lineal::Line` has two encodings: `@x` and `@y`. Meanwhile, `Lineal::Bar` has four encodings: `@x`, `@y`, `@width`, and `@height`.

In our line chart, `@x` is set but `@xScale` is not. This works because we can infer defaults for everything:

1. The `domain` of our scale is inferred based on the `time` field of our dataset (`['2022-1-1', '2022-3-1']`)
2. The `range` of our scale can't really be inferred since it's pixel space, but there's still a default for convenience (`[0, 800]`)
3. The `type` of our scale is determined by the encoding. For `Lineal::Line` `@x` this default scale type is linear.

At this point, we already have a line chart...technically. Charts also tend to have axes, gridlines, and a tooltip. We'll get there.

### 3. Addings axes and gridlines

Axes and gridlines are both visual representations of their underlying scales. This remains true in Lineal.

```hbs
{{#if (and xScale.isValid yScale.isValid)}}
  <Lineal::Axis
    @scale={{yScale}}
    @orientation='left'
    @tickValues={{array 20000000 100000000 200000000 280000000}}
  />
  <Lineal::Axis
    @scale={{xScale}}
    @orientation='bottom'
    transform='translate(0,200)'
  />
  <Lineal::Gridlines
    @scale={{yScale}}
    @lineValues={{array 20000000 100000000 200000000 280000000}}
    @direction='horizontal'
    @length={{800}}
    stroke-dasharray='5 5'
    opacity='0.7'
  />
  <Lineal::Gridlines
    @scale={{xScale}}
    @direction='vertical'
    @length={{200}}
    stroke-dasharray='5 5'
    opacity='0.3'
  />
{{/if}}
```

Here we define a left-aligned y-axis, a bottom-aligned x-axis, and horizontal and vertical gridlines. Once more these components just emit SVG elements, so we can add attributes to control features like transform and stroke qualities.

The `Lineal::Axis` component is a complete Glimmer rewrite of the [d3-axis]() package and supports the same arguments, such as specific tick values that override what gets derived from the underlying scale.

Traditionally in d3, gridlines are also implemented using d3-axis. In Lineal, the `Lineal::Gridlines` component paves this common pattern which means no more imperatively removing tick labels and tweaking tick dimensions to match the dimensions of the chart canvas.

### 4. Creating a tooltip

TBD

### 5. Making a chart responsive

TBD

### 6. Using a plot component

TBD

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
