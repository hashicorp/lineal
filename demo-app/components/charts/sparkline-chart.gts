/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { array } from '@ember/helper';

import Line from '@lineal-viz/lineal/components/line';
import Area from '@lineal-viz/lineal/components/area';
import scaleLinear from '@lineal-viz/lineal/helpers/scale-linear';

interface SparklineSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
    value?: string;
    delta?: number;
    color?: string;
    data?: number[];
  };
}

export default class SparklineChart extends Component<SparklineSignature> {
  get color() {
    return this.args.color ?? '#6366f1';
  }

  get delta() {
    return this.args.delta ?? 0;
  }

  get isPositive() {
    return this.delta >= 0;
  }

  @cached
  get data() {
    if (this.args.data) {
      return this.args.data.map((value, i) => ({ x: i, y: value }));
    }
    // Generate random trend data
    const points = [];
    let value = 50;
    for (let i = 0; i < 20; i++) {
      value = Math.max(10, Math.min(90, value + (Math.random() - 0.45) * 15));
      points.push({ x: i, y: value });
    }
    return points;
  }

  <template>
    <div class="sparkline-card" ...attributes>
      <div class="sparkline-card__content">
        <span class="sparkline-card__title">{{if @title @title "Metric"}}</span>
        <span class="sparkline-card__value">{{if @value @value "—"}}</span>
        <span
          class="sparkline-card__change
            {{if this.isPositive 'is-positive' 'is-negative'}}"
        >
          {{if this.isPositive "↑" "↓"}}
          {{if this.isPositive this.delta this.delta}}%
        </span>
      </div>
      <div class="sparkline-card__chart">
        <svg width="120" height="48" class="chart-svg" style="overflow: hidden">
          <defs>
            <clipPath id="sparkClip-{{this.color}}">
              <rect x="0" y="0" width="120" height="48" />
            </clipPath>
            <linearGradient
              id="sparkGradient-{{this.color}}"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stop-color={{this.color}} stop-opacity="0.3" />
              <stop offset="100%" stop-color={{this.color}} stop-opacity="0" />
            </linearGradient>
          </defs>
          {{#let
            (scaleLinear range=(array 4 116) domain="..")
            (scaleLinear range=(array 44 4) domain="..")
            as |xScale yScale|
          }}
            <g clip-path="url(#sparkClip-{{this.color}})">
              <Area
                @data={{this.data}}
                @xScale={{xScale}}
                @yScale={{yScale}}
                @x="x"
                @y="y"
                @y0={{0}}
                @curve="monotoneX"
                fill="url(#sparkGradient-{{this.color}})"
              />
            </g>
            <Line
              @data={{this.data}}
              @xScale={{xScale}}
              @yScale={{yScale}}
              @x="x"
              @y="y"
              @curve="monotoneX"
              fill="transparent"
              stroke={{this.color}}
              stroke-width="2"
            />
          {{/let}}
        </svg>
      </div>
    </div>
  </template>
}
