```hbs template
<h1>Energy Mix by Region in the G20</h1>
<p>The countries that use the most energy from renewable energy sources per
capita are also still using more energy from fossil fuels per capita than
countries with lower GDP.</p>
<p>Canada stands out as the consumer of the most energy per capita, likely
due to being far north (heating) and sparse (commuting). Saudi Arabia
stands out as having virtually no renewables in their energy mix.</p>

{{#let (stack-h
  data=this.divergingData
  x='value'
  y='Entity'
  z='source'
  offset='diverging'
) as |stacked|}}
  <ol class='legend'>
    {{#each stacked.categories as |category idx|}}
      <li class='energy-mix-{{inc idx}}'>
        <span>{{this.niceLabel category}}</span>
      </li>
    {{/each}}
  </ol>
  <div class='demo-chart-energy-mix'>
    {{#if this.load.isRunning}}
      <p>Loading&hellip;</p>
    {{else}}
      <Lineal::Fluid as |width height|>
        <svg height='800' class='fluid'>
          {{#let
            (scale-linear range=(array 0 width) domain='..')
            (scale-band range='0..800' domain=this.g20ByConsumption)
            as |xScale yScale|
          }}
            {{#if (and xScale.isValid yScale.isValid)}}
              <Lineal::Axis
                @scale={{yScale}}
                @orientation='left'
                @includeDomain={{false}}
              />
              <Lineal::Axis
                @scale={{xScale}}
                @orientation='top'
                @tickCount={{5}}
                @includeDomain={{false}}
              />
              <Lineal::Gridlines
                @scale={{xScale}}
                @direction='vertical'
                @length='800'
                stroke-dasharray='5 5'
              />
            {{/if}}
            <Lineal::HBars
              @data={{stacked.data}}
              @height={{30}}
              @xScale={{xScale}}
              @yScale={{yScale}}
              @colorScale='energy-mix'
            />
          {{/let}}
        </svg>
      </Lineal::Fluid>
    {{/if}}
  </div>
{{/let}}
```

```js component
import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { flatGroup } from 'd3-array';

export default class extends Component {
  @tracked data = [];

  load = task(async () => {
    const req = await fetch('/datasets/g20-energy-mix-records.json');
    this.data = await req.json();
  });

  constructor(owner, args) {
    super(owner, args);
    this.load.perform();
  }

  @cached get divergingData() {
    const fossilFuels = [
      'Coal per capita (kWh)',
      'Oil per capita (kWh)',
      'Gas per capita (kWh)'
    ];

    // Just like with diverging scales, negative values go one way
    // and positive values go the other way.
    return this.data.map((d) => {
      const value = fossilFuels.includes(d.source) ? -d.value : d.value;
      return { ...d, value };
    });
  }

  // Get the set of regions from the dataset
  @cached get g20() {
    return Array.from(new Set(this.data.map((d) => d.Entity)));
  }

  // Sort the regions based on total consumption
  @cached get g20ByConsumption() {
    const agg = this.data.reduce(
      (hash, record) => {
        const region = hash[record.Entity] ?? {
          region: record.Entity,
          sum: 0,
        };
        region.sum += record.value;
        hash[record.Entity] = region;
        return hash;
      },
      {}
    );
    return this.g20.sort((a, b) => agg[b].sum - agg[a].sum);
  }

  niceLabel = (label) => label.split(' per')[0];
}
```
