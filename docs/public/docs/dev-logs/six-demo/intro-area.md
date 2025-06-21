```hbs template
<h1>How many cylinders does your car have?</h1>
<p>Probably 4! But the US has a reputation for making bigger cars.</p>

<ol class="legend">
  <li class="cool-1"><span>Japan</span></li>
  <li class="cool-2"><span>Europe</span></li>
  <li class="cool-3"><span>USA</span></li>
</ol>
<div class="demo-chart-with-axes with-left-axis with-legend">
  {{#if this.load.isRunning}}
    <p>Loading&hellip;</p>
  {{else}}
    <Lineal::Fluid as |width height|>
      <svg class="fluid" height="300" style="overflow:visible;">
        <title>Stacked bar chart of cars by region and cylinder.</title>
        {{#let
          (scale-point domain=this.cylinders range=(array 0 width) padding=0.2)
          (scale-linear domain="0.." range="300..0")
          as |xScale yScale|
        }}
          {{#if (and xScale.isValid yScale.isValid)}}
            <Lineal::GridLines
              @scale={{yScale}}
              @direction="horizontal"
              @length={{width}}
            />
            <Lineal::GridLines
              @scale={{xScale}}
              @direction="vertical"
              @length="300"
            />
            <Lineal::Axis @scale={{yScale}} @orientation="left" />
            <Lineal::Axis
              @scale={{xScale}}
              @orientation="bottom"
              transform="translate(0,300)"
            />
          {{/if}}
          <Lineal::Area
            @data={{this.carsByCylinders}}
            @x="cylinders"
            @y="cars"
            @color="region"
            @xScale={{xScale}}
            @yScale={{yScale}}
            @colorScale="cool"
          />
        {{/let}}
      </svg>
    </Lineal::Fluid>
  {{/if}}
</div>
<p>
  Data from
  <a href="https://github.com/vega/vega-datasets/blob/main/data/cars.json">Vega
    Datasets</a>
</p>
```

```js component
import Component from "@glimmer/component";
import { tracked, cached } from "@glimmer/tracking";
import { task } from "ember-concurrency";
import { flatGroup } from "d3-array";

export default class extends Component {
  @tracked data = [];

  load = task(async () => {
    const req = await fetch("/datasets/cars.json");
    this.data = await req.json();
  });

  constructor(owner, args) {
    super(owner, args);
    this.load.perform();
  }

  @cached get carsByCylinders() {
    const grouped = flatGroup(
      this.data,
      (d) => d.Cylinders,
      (d) => d.Origin,
    );
    return grouped
      .map(([cylinders, region, cars]) => ({
        cylinders,
        region,
        cars: cars.length,
      }))
      .sort((a, b) => a.cylinders - b.cylinders);
  }

  @cached get cylinders() {
    return Array.from(new Set(this.carsByCylinders.map((d) => d.cylinders)));
  }
}
```
