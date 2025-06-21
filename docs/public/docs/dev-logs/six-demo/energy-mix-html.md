```hbs template
<h1>Energy Mix by Region in the G20</h1>
<p>The countries that use the most energy from renewable energy sources per
  capita are also still using more energy from fossil fuels per capita than
  countries with lower GDP.</p>
<p>Canada stands out as the consumer of the most energy per capita, likely due
  to being far north (heating) and sparse (commuting). Saudi Arabia stands out
  as having virtually no renewables in their energy mix.</p>

{{#if this.load.isRunning}}
  <p>Loading&hellip;</p>
{{else}}
  <ol class="legend">
    {{#each this.sources as |category idx|}}
      <li class="energy-mix-{{inc idx}}">
        <span>{{this.niceLabel category}}</span>
      </li>
    {{/each}}
  </ol>
  <Lineal::Fluid as |width height|>
    {{#let
      (scale-linear range=(array 0 (sub width 200)) domain=this.bounds)
      as |scale|
    }}
      <dl class="energy-mix-flex-chart">
        {{#each this.bespokeStack as |region|}}
          <dt>{{region.name}}</dt>
          <dd
            {{style
              --zero=(str (scale.compute this.zeroPoint))
              --left=(str (scale.compute region.totalFossilFuels))
            }}
          >
            {{#each region.sources as |source idx|}}
              <div
                class="energy-mix energy-mix-{{inc idx}}"
                aria-label="{{this.niceLabel source.source}} {{fmt
                  source.value
                }}"
                {{style --w=(str (scale.compute source.value))}}
              />
            {{/each}}
          </dd>
        {{/each}}
      </dl>
    {{/let}}
  </Lineal::Fluid>
{{/if}}
```

```js component
import Component from "@glimmer/component";
import { tracked, cached } from "@glimmer/tracking";
import { task } from "ember-concurrency";
import { flatGroup, sum, max } from "d3-array";

const sortKey = {
  Coal: 0,
  Oil: 1,
  Gas: 2,
  Nuclear: 3,
  Hydro: 4,
  Wind: 5,
  Solar: 6,
  Other: 7,
};

export default class extends Component {
  @tracked data = [];

  load = task(async () => {
    const req = await fetch("/datasets/g20-energy-mix-records.json");
    this.data = await req.json();
  });

  constructor(owner, args) {
    super(owner, args);
    this.load.perform();
  }

  @cached get bespokeStack() {
    // Instead of grouping by energy source, we want to group by region
    const grouped = flatGroup(this.data, (d) => d.Entity);

    // While we're here, sort energy mix to ensure consistent ordering
    grouped.forEach((region) => {
      region[1].sort(
        (a, b) =>
          sortKey[a.source.split(" ")[0]] - sortKey[b.source.split(" ")[0]],
      );
    });

    // Now convert it into a better shape with some stats
    const analyzed = grouped.map((series) => ({
      name: series[0],
      sources: series[1],
      total: sum(series[1].map((_) => _.value)),
      totalFossilFuels: sum(series[1].slice(0, 3).map((_) => _.value)),
    }));

    // And sort by total descending
    return analyzed.sort((a, b) => a.total - b.total).reverse();
  }

  @cached get bounds() {
    // The full extent of the diverging dataset is the delta from the lowest cumulative
    // fossil fuel value and the highest cumulative renewable energy value.
    const mostFossilFuel = max(this.bespokeStack, (d) => d.totalFossilFuels);
    const mostRenewable = max(
      this.bespokeStack,
      (d) => d.total - d.totalFossilFuels,
    );
    return [0, mostFossilFuel + mostRenewable];
  }

  @cached get zeroPoint() {
    // All stacks are translated rightward to the zero point, which is the max of all
    // cumulative fossil fuels, and then back left based on fossil fuel consumption.
    // (the actual translation happens in CSS, we just calculate the zero point upfront)
    return max(this.bespokeStack, (d) => d.totalFossilFuels);
  }

  @cached get sources() {
    return this.bespokeStack[0].sources.map((_) => _.source);
  }

  niceLabel = (label) => label.split(" per")[0];
}
```
