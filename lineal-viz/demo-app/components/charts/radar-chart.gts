/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { eq } from 'ember-truth-helpers';
import { htmlSafe } from '@ember/template';

interface RadarChartSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
  };
}

interface ComputedAxis {
  name: string;
  endX: number;
  endY: number;
  labelX: number;
  labelY: number;
}

interface ComputedPoint {
  x: number;
  y: number;
}

interface ComputedSeries {
  name: string;
  color: string;
  polygonPoints: string;
  points: ComputedPoint[];
  dotStyle: ReturnType<typeof htmlSafe>;
}

const polyStyle = htmlSafe('transition: all 0.2s ease; cursor: pointer;');
const circleStyle = htmlSafe('transition: all 0.2s ease;');

export default class RadarChart extends Component<RadarChartSignature> {
  @tracked activeSeries: string | null = null;

  axisNames = [
    'Speed',
    'Reliability',
    'Comfort',
    'Safety',
    'Efficiency',
    'Style',
  ];
  maxValue = 100;
  radius = 100;
  levels = [20, 40, 60, 80, 100];

  get angleSlice() {
    return (Math.PI * 2) / this.axisNames.length;
  }

  polarToCartesian(angle: number, value: number): { x: number; y: number } {
    const r = (value / this.maxValue) * this.radius;
    return {
      x: r * Math.cos(angle - Math.PI / 2),
      y: r * Math.sin(angle - Math.PI / 2),
    };
  }

  @cached
  get axes(): ComputedAxis[] {
    return this.axisNames.map((name, i) => {
      const endpoint = this.polarToCartesian(
        i * this.angleSlice,
        this.maxValue,
      );
      return {
        name,
        endX: endpoint.x,
        endY: endpoint.y,
        labelX: endpoint.x * 1.15,
        labelY: endpoint.y * 1.15,
      };
    });
  }

  @cached
  get levelPolygons(): string[] {
    return this.levels.map((level) =>
      this.axisNames
        .map((_, i) => {
          const { x, y } = this.polarToCartesian(i * this.angleSlice, level);
          return `${x},${y}`;
        })
        .join(' '),
    );
  }

  @cached
  get series(): ComputedSeries[] {
    const rawSeries = [
      {
        name: 'Model A',
        color: '#6366f1',
        values: [85, 70, 90, 75, 60, 95],
      },
      {
        name: 'Model B',
        color: '#10b981',
        values: [70, 95, 65, 90, 85, 60],
      },
    ];

    return rawSeries.map((s) => {
      const points = s.values.map((v, i) =>
        this.polarToCartesian(i * this.angleSlice, v),
      );
      return {
        name: s.name,
        color: s.color,
        polygonPoints: points.map((p) => `${p.x},${p.y}`).join(' '),
        points,
        dotStyle: htmlSafe(`background: ${s.color}`),
      };
    });
  }

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Product Comparison"}}</h3>
      </div>
      <div class="chart-card__body chart-card__body--centered">
        <svg
          width="300"
          height="280"
          viewBox="-140 -130 280 260"
          class="chart-svg"
        >
          {{! Grid levels }}
          {{#each this.levelPolygons as |points|}}
            <polygon
              points={{points}}
              fill="none"
              stroke="#e2e8f0"
              stroke-width="1"
            />
          {{/each}}

          {{! Axis lines and labels }}
          {{#each this.axes as |axis|}}
            <line
              x1="0"
              y1="0"
              x2={{axis.endX}}
              y2={{axis.endY}}
              stroke="#cbd5e1"
              stroke-width="1"
            />
            <text
              x={{axis.labelX}}
              y={{axis.labelY}}
              text-anchor="middle"
              dominant-baseline="middle"
              class="radar-label"
            >{{axis.name}}</text>
          {{/each}}

          {{! Data polygons }}
          {{#each this.series as |s|}}
            <polygon
              points={{s.polygonPoints}}
              fill={{s.color}}
              fill-opacity={{if
                this.activeSeries
                (if (eq this.activeSeries s.name) "0.4" "0.1")
                "0.25"
              }}
              stroke={{s.color}}
              stroke-width="2"
              style={{polyStyle}}
              {{on "mouseenter" (fn (mut this.activeSeries) s.name)}}
              {{on "mouseleave" (fn (mut this.activeSeries) null)}}
            />
            {{! Data points }}
            {{#each s.points as |point|}}
              <circle
                cx={{point.x}}
                cy={{point.y}}
                r="4"
                fill={{s.color}}
                stroke="white"
                stroke-width="2"
                style={{circleStyle}}
              />
            {{/each}}
          {{/each}}
        </svg>
        <div class="chart-legend">
          {{#each this.series as |s|}}
            <button
              type="button"
              class="chart-legend__item
                {{if (eq this.activeSeries s.name) 'is-active'}}"
              {{on "mouseenter" (fn (mut this.activeSeries) s.name)}}
              {{on "mouseleave" (fn (mut this.activeSeries) null)}}
            >
              <span class="chart-legend__dot" style={{s.dotStyle}}></span>
              {{s.name}}
            </button>
          {{/each}}
        </div>
      </div>
    </div>
  </template>
}
