---
title: Line Chart Demo
order: 1
---

# Line Chart

A line chart of U.S. population over the last few decades.

```gjs live preview
import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { scaleLinear } from '@lineal-viz/lineal/helpers';
import { Line, Fluid } from '@lineal-viz/lineal/components';
import { array } from '@ember/helper';
import { and } from '~docs/helpers/truth-helpers';

export default class PopulationChart extends Component {
  @tracked data = [];

  @cached get population() {
    const reduction = this.data.reduce((agg, record) => {
      agg[record.year] = agg[record.year]
        ? agg[record.year] + record.people
        : record.people;
      return agg;
    }, {});

    return Object.entries(reduction).map(([year, people]) => ({
      year: Number(year),
      people,
    }));
  }

  constructor(owner, args) {
    super(owner, args);
    this.loadData();
  }

  async loadData() {
    const url = 'https://raw.githubusercontent.com/vega/vega-datasets/next/data/population.json';
    const res = await fetch(url);
    this.data = await res.json();
  }

  <template>
    {{#if this.population.length}}
      <Fluid as |width|>
        <svg width={{width}} height='200'>
          {{#let
            (scaleLinear range=(array 15 width))
            (scaleLinear range='190..10')
            as |xScale yScale|
          }}
            <Line
              @data={{this.population}}
              @xScale={{xScale}}
              @yScale={{yScale}}
              @x='year'
              @y='people'
              @curve='natural'
              fill='transparent'
              stroke='currentColor'
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
      </Fluid>
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
  </template>
}
```
