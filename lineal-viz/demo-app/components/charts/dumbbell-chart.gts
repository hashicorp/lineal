/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { htmlSafe } from '@ember/template';

interface DumbbellSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
  };
}

interface ComputedDumbbellItem {
  label: string;
  start: number;
  end: number;
  yPos: number;
  startX: number;
  endX: number;
}

const lineStyle = htmlSafe('cursor: pointer; transition: all 0.15s ease;');
const circleStyle = htmlSafe('cursor: pointer; transition: all 0.15s ease;');
const startDot = htmlSafe('background: #94a3b8');
const endDot = htmlSafe('background: #6366f1');

export default class DumbbellChart extends Component<DumbbellSignature> {
  @tracked activeItem: string | null = null;

  // Chart dimensions
  chartWidth = 480;
  chartHeight = 220;
  leftMargin = 100;
  rightMargin = 20;

  @cached
  get data(): ComputedDumbbellItem[] {
    const rawData = [
      { label: 'Product A', start: 45, end: 78 },
      { label: 'Product B', start: 52, end: 65 },
      { label: 'Product C', start: 38, end: 82 },
      { label: 'Product D', start: 60, end: 72 },
      { label: 'Product E', start: 35, end: 90 },
    ];

    const xMin = this.leftMargin;
    const xMax = this.chartWidth - this.rightMargin;
    const xRange = xMax - xMin;

    const rowHeight = this.chartHeight / rawData.length;
    const padding = rowHeight * 0.2;

    return rawData.map((d, i) => ({
      ...d,
      yPos: padding + rowHeight * i + rowHeight / 2,
      startX: xMin + (d.start / 100) * xRange,
      endX: xMin + (d.end / 100) * xRange,
    }));
  }

  get xTicks(): Array<{ value: number; x: number }> {
    const xMin = this.leftMargin;
    const xMax = this.chartWidth - this.rightMargin;
    const xRange = xMax - xMin;

    return [0, 25, 50, 75, 100].map((v) => ({
      value: v,
      x: xMin + (v / 100) * xRange,
    }));
  }

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Q1 to Q4 Progress"}}</h3>
      </div>
      <div class="chart-card__body">
        <svg
          width="100%"
          height="280"
          viewBox="0 0 {{this.chartWidth}} 280"
          class="chart-svg"
        >
          {{! X-axis }}
          <line
            x1={{this.leftMargin}}
            y1={{this.chartHeight}}
            x2={{this.chartWidth}}
            y2={{this.chartHeight}}
            stroke="#e2e8f0"
            stroke-width="1"
          />
          {{#each this.xTicks as |tick|}}
            <text
              x={{tick.x}}
              y="240"
              text-anchor="middle"
              class="chart-axis-label"
            >{{tick.value}}</text>
            <line
              x1={{tick.x}}
              y1={{this.chartHeight}}
              x2={{tick.x}}
              y2="225"
              stroke="#e2e8f0"
              stroke-width="1"
            />
          {{/each}}

          {{#each this.data as |item|}}
            {{! Label }}
            <text
              x="95"
              y={{item.yPos}}
              text-anchor="end"
              dominant-baseline="middle"
              class="chart-axis-label"
            >{{item.label}}</text>

            {{! Connecting line }}
            <line
              x1={{item.startX}}
              y1={{item.yPos}}
              x2={{item.endX}}
              y2={{item.yPos}}
              stroke="#cbd5e1"
              stroke-width="4"
              stroke-linecap="round"
              style={{lineStyle}}
              {{on "mouseenter" (fn (mut this.activeItem) item.label)}}
              {{on "mouseleave" (fn (mut this.activeItem) null)}}
            />

            {{! Start circle (Q1) }}
            <circle
              cx={{item.startX}}
              cy={{item.yPos}}
              r="8"
              fill="#94a3b8"
              stroke="white"
              stroke-width="2"
              style={{circleStyle}}
              {{on "mouseenter" (fn (mut this.activeItem) item.label)}}
              {{on "mouseleave" (fn (mut this.activeItem) null)}}
            />

            {{! End circle (Q4) }}
            <circle
              cx={{item.endX}}
              cy={{item.yPos}}
              r="8"
              fill="#6366f1"
              stroke="white"
              stroke-width="2"
              style={{circleStyle}}
              {{on "mouseenter" (fn (mut this.activeItem) item.label)}}
              {{on "mouseleave" (fn (mut this.activeItem) null)}}
            />
          {{/each}}
        </svg>
        <div class="chart-legend">
          <span class="chart-legend__item">
            <span class="chart-legend__dot" style={{startDot}}></span>
            Q1
          </span>
          <span class="chart-legend__item">
            <span class="chart-legend__dot" style={{endDot}}></span>
            Q4
          </span>
        </div>
      </div>
    </div>
  </template>
}
