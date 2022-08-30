# Line Chart

A line chart of U.S. population over the last few decades.

```hbs template
<div {{did-insert this.loadData}}>
  {{#if this.population.length}}
    <svg width='800' height='200'>
      {{#let
        (scale-linear range='15..785')
        (scale-linear range='190..10')
        as |xScale yScale|
      }}
        <Lineal::Line
          @data={{this.population}}
          @xScale={{xScale}}
          @yScale={{yScale}}
          @x='year'
          @y='people'
          @curve='step'
          fill='transparent'
          stroke='black'
          stroke-width='2'
        />
        {{#if (and xScale.isValid yScale.isValid)}}
          {{#each this.population as |d|}}
            <circle
              cx={{xScale.compute d.year}}
              cy={{yScale.compute d.people}}
              r='3'
            ></circle>
          {{/each}}
        {{/if}}
      {{/let}}
    </svg>
    <table>
      <thead>
        <tr>
          <th>Year</th>
          <th>People</th>
        </tr>
      </thead>
      {{#each this.population as |row|}}
        <tr>
          <td>{{row.year}}</td>
          <td>{{row.people}}</td>
        </tr>
      {{/each}}
    </table>
  {{else}}
    Loading&hellip;
  {{/if}}
</div>
```

```js component
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked, cached } from '@glimmer/tracking';

export default class extends Component {
  @tracked data = [];

  @cached get population() {
    const reduction = this.data.reduce((agg, record) => {
      agg[record.year] = agg[record.year]
        ? agg[record.year] + record.people
        : record.people;
      return agg;
    }, {});

    return Object.entries(reduction).map(([year, people]) => ({
      year,
      people,
    }));
  }

  @action
  async loadData() {
    const url = 'https://raw.githubusercontent.com/vega/vega-datasets/next/data/population.json';
    const data = await fetch(url);

    this.data = await data.json();
  }
}
```
