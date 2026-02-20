/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { and } from 'ember-truth-helpers';

import Axis, {
  Direction,
  Orientation,
} from '@lineal-viz/lineal/components/axis';
import GridLines from '@lineal-viz/lineal/components/grid-lines';
import stackV from '@lineal-viz/lineal/helpers/stack-v';
import scaleLinear from '@lineal-viz/lineal/helpers/scale-linear';
import scaleBand from '@lineal-viz/lineal/helpers/scale-band';
import VBars from '@lineal-viz/lineal/components/v-bars';

interface StackedBarChartSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
  };
}

// Colors handled by colorScale

export default class StackedBarChart extends Component<StackedBarChartSignature> {
  @tracked activeCategory: string | null = null;

  categories = ['Product A', 'Product B', 'Product C', 'Product D'];
  quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  @cached
  get data() {
    const result: { quarter: string; category: string; value: number }[] = [];
    this.quarters.forEach((quarter, qi) => {
      this.categories.forEach((category, ci) => {
        result.push({
          quarter,
          category,
          value: 15 + qi * 5 + ci * 8 + Math.round(Math.random() * 20),
        });
      });
    });
    return result;
  }

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Quarterly Performance"}}</h3>
      </div>
      <div class="chart-card__body">
        <svg width="100%" height="300" viewBox="0 0 600 300" class="chart-svg">
          {{#let
            (scaleBand domain=this.quarters range="50..580" padding=0.25)
            (scaleLinear range="260..20" domain="0..")
            (stackV data=this.data x="quarter" y="value" z="category")
            as |xScale yScale stacked|
          }}
            {{#if (and xScale.isValid yScale.isValid)}}
              <GridLines
                @scale={{yScale}}
                @direction={{Direction.Horizontal}}
                @length={{530}}
                @lineCount={{5}}
                class="chart-grid"
                transform="translate(50,0)"
              />
              <Axis
                @scale={{yScale}}
                @orientation={{Orientation.Left}}
                @tickCount={{5}}
                class="chart-axis"
                transform="translate(50,0)"
              />
              <Axis
                @scale={{xScale}}
                @orientation={{Orientation.Bottom}}
                transform="translate(0,260)"
                class="chart-axis"
              />
            {{/if}}
            <VBars
              @data={{stacked.data}}
              @x="x"
              @y="y"
              @width={{xScale.bandwidth}}
              @xScale={{xScale}}
              @yScale={{yScale}}
              @colorScale="ordinal"
              @borderRadius="2"
            />
          {{/let}}
        </svg>
        <div class="chart-legend">
          {{#each this.categories as |cat index|}}
            <span class="chart-legend__item">
              <span class="chart-legend__dot ordinal-{{index}}"></span>
              {{cat}}
            </span>
          {{/each}}
        </div>
      </div>
    </div>
  </template>
}
