/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn, array } from '@ember/helper';
import { eq } from 'ember-truth-helpers';

import Arcs from '@lineal-viz/lineal/components/arcs';
import Arc from '@lineal-viz/lineal/components/arc';
import scaleOrdinal from '@lineal-viz/lineal/helpers/scale-ordinal';

interface DonutChartDatum {
  label: string;
  value: number;
  color: string;
}

interface DonutChartSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
    data?: DonutChartDatum[];
  };
}

export default class DonutChart extends Component<DonutChartSignature> {
  @tracked activeIndex: number | null = null;

  @cached
  get data(): DonutChartDatum[] {
    return (
      this.args.data ?? [
        { label: 'Enterprise', value: 45, color: '#6366f1' },
        { label: 'Team', value: 28, color: '#10b981' },
        { label: 'Starter', value: 18, color: '#f59e0b' },
        { label: 'Free', value: 9, color: '#ec4899' },
      ]
    );
  }

  get activeDatum(): DonutChartDatum | null {
    return this.activeIndex !== null
      ? (this.data[this.activeIndex] ?? null)
      : null;
  }

  get total() {
    return this.data.reduce((sum, d) => sum + d.value, 0);
  }

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Distribution"}}</h3>
      </div>
      <div class="chart-card__body chart-card__body--centered">
        <svg width="280" height="280" class="chart-svg">
          <defs>
            <filter
              id="donut-shadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.1" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g transform="translate(140 140)">
            <Arcs
              @data={{this.data}}
              @theta="value"
              @color="label"
              @colorScale={{scaleOrdinal
                domain=(array "Enterprise" "Team" "Starter" "Free")
                range=(array "#6366f1" "#10b981" "#f59e0b" "#ec4899")
              }}
              @startAngle="0d"
              @endAngle="360d"
              @padAngle="1.5d"
              as |pie|
            >
              {{#each pie as |slice index|}}
                <Arc
                  @startAngle={{slice.startAngle}}
                  @endAngle={{slice.endAngle}}
                  @outerRadius={{if
                    (eq this.activeIndex index)
                    120
                    (if (eq this.activeIndex null) 115 110)
                  }}
                  @innerRadius={{75}}
                  @cornerRadius={{4}}
                  fill={{slice.fill}}
                  filter="url(#donut-shadow)"
                  {{! template-lint-disable no-inline-styles }}
                  style="transition: all 0.2s ease-out; cursor: pointer;"
                  {{on "mouseenter" (fn (mut this.activeIndex) index)}}
                  {{on "mouseleave" (fn (mut this.activeIndex) null)}}
                />
              {{/each}}
            </Arcs>
            <text
              text-anchor="middle"
              dominant-baseline="middle"
              class="donut-center-text"
            >
              {{#if this.activeDatum}}
                <tspan
                  x="0"
                  dy="-8"
                  class="donut-value"
                >{{this.activeDatum.value}}%</tspan>
                <tspan
                  x="0"
                  dy="24"
                  class="donut-label"
                >{{this.activeDatum.label}}</tspan>
              {{else}}
                <tspan x="0" dy="-8" class="donut-value">{{this.total}}%</tspan>
                <tspan x="0" dy="24" class="donut-label">Total</tspan>
              {{/if}}
            </text>
          </g>
        </svg>
        <div class="chart-legend">
          {{#each this.data as |item index|}}
            <button
              type="button"
              class="chart-legend__item
                {{if (eq this.activeIndex index) 'is-active'}}"
              {{on "mouseenter" (fn (mut this.activeIndex) index)}}
              {{on "mouseleave" (fn (mut this.activeIndex) null)}}
            >
              {{! template-lint-disable no-inline-styles style-concatenation }}
              <span
                class="chart-legend__dot"
                style="background: {{item.color}}"
              ></span>
              <span class="chart-legend__text">{{item.label}}</span>
              <span class="chart-legend__value">{{item.value}}%</span>
            </button>
          {{/each}}
        </div>
      </div>
    </div>
  </template>
}
