/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { eq } from 'ember-truth-helpers';
import { htmlSafe } from '@ember/template';

interface CandlestickSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
  };
}

interface OHLC {
  day: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ComputedOHLC extends OHLC {
  x: number;
  highY: number;
  lowY: number;
  bodyY: number;
  bodyHeight: number;
  isBullish: boolean;
}

const candleStyle = htmlSafe(
  'cursor: pointer; transition: opacity 0.15s ease;',
);

export default class CandlestickChart extends Component<CandlestickSignature> {
  @tracked activeDay: string | null = null;

  // Chart dimensions
  chartWidth = 500;
  chartHeight = 280;
  leftMargin = 50;
  rightMargin = 30;
  topMargin = 20;
  bottomMargin = 40;
  candleWidth = 50;
  candleSpacing = 20;

  rawData: OHLC[] = [
    { day: 'Mon', open: 100, high: 108, low: 98, close: 105 },
    { day: 'Tue', open: 105, high: 112, low: 103, close: 110 },
    { day: 'Wed', open: 110, high: 115, low: 105, close: 107 },
    { day: 'Thu', open: 107, high: 109, low: 95, close: 98 },
    { day: 'Fri', open: 98, high: 104, low: 94, close: 102 },
  ];

  get yMin(): number {
    return Math.min(...this.rawData.map((d) => d.low)) - 5;
  }

  get yMax(): number {
    return Math.max(...this.rawData.map((d) => d.high)) + 5;
  }

  scaleY(value: number): number {
    const chartArea = this.chartHeight - this.topMargin - this.bottomMargin;
    return (
      this.topMargin +
      chartArea * (1 - (value - this.yMin) / (this.yMax - this.yMin))
    );
  }

  @cached
  get data(): ComputedOHLC[] {
    const startX = this.leftMargin + this.candleSpacing;
    const step = this.candleWidth + this.candleSpacing;

    return this.rawData.map((d, i) => {
      const isBullish = d.close >= d.open;
      const bodyTop = Math.max(d.open, d.close);
      const bodyBottom = Math.min(d.open, d.close);

      return {
        ...d,
        x: startX + i * step,
        highY: this.scaleY(d.high),
        lowY: this.scaleY(d.low),
        bodyY: this.scaleY(bodyTop),
        bodyHeight: Math.max(this.scaleY(bodyBottom) - this.scaleY(bodyTop), 4),
        isBullish,
      };
    });
  }

  @cached
  get yTicks(): Array<{ value: number; y: number }> {
    const ticks = [90, 95, 100, 105, 110, 115, 120];
    return ticks
      .filter((v) => v >= this.yMin && v <= this.yMax)
      .map((v) => ({
        value: v,
        y: this.scaleY(v),
      }));
  }

  get viewBox(): string {
    return `0 0 ${this.chartWidth} ${this.chartHeight}`;
  }

  <template>
    <div class="chart-card candlestick-chart" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Weekly Trading"}}</h3>
        {{#if this.activeDay}}
          {{#each this.data as |d|}}
            {{#if (eq this.activeDay d.day)}}
              <div class="chart-card__value">
                <span class="chart-card__label">{{d.day}}</span>
                <span class="candlestick-ohlc">
                  O:{{d.open}}
                  H:{{d.high}}
                  L:{{d.low}}
                  C:{{d.close}}
                </span>
              </div>
            {{/if}}
          {{/each}}
        {{/if}}
      </div>
      <div class="chart-card__body">
        <svg
          viewBox={{this.viewBox}}
          class="chart-svg"
          style="max-width: 500px;"
        >
          {{! Grid lines }}
          {{#each this.yTicks as |tick|}}
            <line
              x1={{this.leftMargin}}
              y1={{tick.y}}
              x2={{this.chartWidth}}
              y2={{tick.y}}
              stroke="#e2e8f0"
              stroke-width="1"
            />
            <text
              x={{this.leftMargin}}
              y={{tick.y}}
              dx="-8"
              text-anchor="end"
              dominant-baseline="middle"
              class="chart-axis-label"
            >{{tick.value}}</text>
          {{/each}}

          {{! Candlesticks }}
          {{#each this.data as |d|}}
            <g
              style={{candleStyle}}
              opacity={{if
                this.activeDay
                (if (eq this.activeDay d.day) 1 0.4)
                1
              }}
              {{on "mouseenter" (fn (mut this.activeDay) d.day)}}
              {{on "mouseleave" (fn (mut this.activeDay) null)}}
            >
              {{! Wick }}
              <line
                x1={{d.x}}
                y1={{d.highY}}
                x2={{d.x}}
                y2={{d.lowY}}
                stroke={{if d.isBullish "#10b981" "#ef4444"}}
                stroke-width="2"
                transform="translate(25, 0)"
              />
              {{! Body }}
              <rect
                x={{d.x}}
                y={{d.bodyY}}
                width={{this.candleWidth}}
                height={{d.bodyHeight}}
                fill={{if d.isBullish "#10b981" "#ef4444"}}
                rx="3"
              />
            </g>
          {{/each}}

          {{! X-axis labels }}
          {{#each this.data as |d|}}
            <text
              x={{d.x}}
              y={{this.chartHeight}}
              dx="25"
              dy="-10"
              text-anchor="middle"
              class="chart-axis-label"
            >{{d.day}}</text>
          {{/each}}
        </svg>
      </div>
    </div>
  </template>
}
