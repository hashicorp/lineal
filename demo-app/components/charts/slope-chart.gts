/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { eq } from 'ember-truth-helpers';
import { htmlSafe } from '@ember/template';

interface SlopeChartSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
  };
}

interface ComputedSlopeItem {
  label: string;
  value2023: number;
  value2024: number;
  color: string;
  y2023: number;
  y2024: number;
  dotStyle: ReturnType<typeof htmlSafe>;
}

const lineStyle = htmlSafe('transition: all 0.2s ease; cursor: pointer;');
const circleStyle = htmlSafe('transition: all 0.2s ease;');

export default class SlopeChart extends Component<SlopeChartSignature> {
  @tracked activeItem: string | null = null;

  @cached
  get data(): ComputedSlopeItem[] {
    const raw = [
      { label: 'Revenue', value2023: 45, value2024: 72, color: '#6366f1' },
      { label: 'Users', value2023: 60, value2024: 85, color: '#10b981' },
      { label: 'Engagement', value2023: 75, value2024: 68, color: '#f59e0b' },
      { label: 'Retention', value2023: 55, value2024: 78, color: '#8b5cf6' },
    ];

    const minVal = Math.min(...raw.flatMap((d) => [d.value2023, d.value2024]));
    const maxVal = Math.max(...raw.flatMap((d) => [d.value2023, d.value2024]));
    const scale = (v: number) => 200 - ((v - minVal) / (maxVal - minVal)) * 160;

    return raw.map((d) => ({
      ...d,
      y2023: scale(d.value2023),
      y2024: scale(d.value2024),
      dotStyle: htmlSafe(`background: ${d.color}`),
    }));
  }

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Year over Year"}}</h3>
      </div>
      <div class="chart-card__body chart-card__body--centered">
        <svg width="400" height="260" class="chart-svg slope-chart-svg">
          {{! Year labels }}
          <text
            x="80"
            y="25"
            text-anchor="middle"
            class="slope-year-label"
          >2023</text>
          <text
            x="320"
            y="25"
            text-anchor="middle"
            class="slope-year-label"
          >2024</text>

          {{! Vertical axis lines }}
          <line
            x1="80"
            y1="35"
            x2="80"
            y2="220"
            stroke="#e2e8f0"
            stroke-width="2"
          />
          <line
            x1="320"
            y1="35"
            x2="320"
            y2="220"
            stroke="#e2e8f0"
            stroke-width="2"
          />

          {{#each this.data as |item|}}
            {{! Connecting line }}
            <line
              x1="80"
              y1={{item.y2023}}
              x2="320"
              y2={{item.y2024}}
              stroke={{item.color}}
              stroke-width="2.5"
              stroke-opacity={{if
                this.activeItem
                (if (eq this.activeItem item.label) 1 0.2)
                0.8
              }}
              style={{lineStyle}}
              {{on "mouseenter" (fn (mut this.activeItem) item.label)}}
              {{on "mouseleave" (fn (mut this.activeItem) null)}}
            />

            {{! Start point }}
            <circle
              cx="80"
              cy={{item.y2023}}
              r="6"
              fill={{item.color}}
              stroke="white"
              stroke-width="2"
              style={{circleStyle}}
            />
            <text
              x="70"
              y={{item.y2023}}
              text-anchor="end"
              dominant-baseline="middle"
              class="slope-value-label"
            >{{item.value2023}}</text>

            {{! End point }}
            <circle
              cx="320"
              cy={{item.y2024}}
              r="6"
              fill={{item.color}}
              stroke="white"
              stroke-width="2"
              style={{circleStyle}}
            />
            <text
              x="330"
              y={{item.y2024}}
              text-anchor="start"
              dominant-baseline="middle"
              class="slope-value-label"
            >{{item.value2024}}</text>
          {{/each}}
        </svg>

        <div class="chart-legend">
          {{#each this.data as |item|}}
            <button
              type="button"
              class="chart-legend__item
                {{if (eq this.activeItem item.label) 'is-active'}}"
              {{on "mouseenter" (fn (mut this.activeItem) item.label)}}
              {{on "mouseleave" (fn (mut this.activeItem) null)}}
            >
              <span class="chart-legend__dot" style={{item.dotStyle}}></span>
              <span class="chart-legend__text">{{item.label}}</span>
              <span class="chart-legend__value">
                {{#if (this.isGrowth item)}}↑{{else}}↓{{/if}}
                {{this.calcChange item}}%
              </span>
            </button>
          {{/each}}
        </div>
      </div>
    </div>
  </template>

  isGrowth = (item: ComputedSlopeItem): boolean => {
    return item.value2024 >= item.value2023;
  };

  calcChange = (item: ComputedSlopeItem): number => {
    return Math.abs(
      Math.round(((item.value2024 - item.value2023) / item.value2023) * 100),
    );
  };
}
