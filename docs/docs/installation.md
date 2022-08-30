# Installation

It's an Ember addon:

```
ember install lineal-viz
```

And then you can do this:

```hbs preview-template
<svg width='400' height='200'>
  <g transform='translate(200 200)'>
    <Lineal::Arcs
      @data={{array (hash v=1) (hash v=10) (hash v=4)}}
      @theta='v'
      @startAngle='270d'
      @endAngle='450d'
      @colorScale='reds'
      as |pie|
    >
      {{#each pie as |slice|}}
        <Lineal::Arc
          @startAngle={{slice.startAngle}}
          @endAngle={{slice.endAngle}}
          @outerRadius={{150}}
          @innerRadius={{100}}
          stroke='white'
          stroke-width='2'
          opacity={{if
            this.activeDatum
            (if (eq slice.data this.activeDatum) 1 0.3)
            1
          }}
          class={{slice.cssClass}}
          {{on 'mouseover' (fn (mut this.activeDatum) slice.data)}}
          {{on 'mouseout' (fn (mut this.activeDatum) null)}}
        />
      {{/each}}
    </Lineal::Arcs>
  </g>
</svg>
```
