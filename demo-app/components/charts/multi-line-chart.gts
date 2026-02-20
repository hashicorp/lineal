/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { array } from '@ember/helper';
import { and } from 'ember-truth-helpers';
import { htmlSafe } from '@ember/template';

import Line from '@lineal-viz/lineal/components/line';
import Area from '@lineal-viz/lineal/components/area';
import Fluid from '@lineal-viz/lineal/components/fluid';
import Axis, { Orientation } from '@lineal-viz/lineal/components/axis';
import GridLines, { Direction } from '@lineal-viz/lineal/components/grid-lines';
import scaleLinear from '@lineal-viz/lineal/helpers/scale-linear';
import interactorCartesianHorizontal from '@lineal-viz/lineal/modifiers/interactor-cartesian-horizontal';

interface MultiLineChartSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
  };
}

interface DataPoint {
  x: number;
  y: number;
}

interface Series {
  name: string;
  color: string;
  data: DataPoint[];
  colorStyle: ReturnType<typeof htmlSafe>;
  dotStyle: ReturnType<typeof htmlSafe>;
}

export default class MultiLineChart extends Component<MultiLineChartSignature> {
  @tracked activeX: number | null = null;

  @cached
  get series(): Series[] {
    const rawSeries = [
      {
        name: 'Revenue',
        color: '#6366f1',
        data: this.generateSeries(100, 1.02),
      },
      { name: 'Users', color: '#10b981', data: this.generateSeries(80, 1.03) },
      {
        name: 'Sessions',
        color: '#f59e0b',
        data: this.generateSeries(60, 1.01),
      },
    ];
    return rawSeries.map((s) => ({
      ...s,
      colorStyle: htmlSafe(`color: ${s.color}`),
      dotStyle: htmlSafe(`background: ${s.color}`),
    }));
  }

  generateSeries(start: number, growth: number): DataPoint[] {
    const data: DataPoint[] = [];
    let value = start;
    for (let x = 0; x < 30; x++) {
      value = value * growth + (Math.random() - 0.5) * 10;
      data.push({ x, y: Math.round(value * 10) / 10 });
    }
    return data;
  }

  updateActiveX = (activeData: any) => {
    this.activeX = activeData ? activeData.datum.datum.x : null;
  };

  get firstSeriesData(): DataPoint[] {
    return this.series[0]?.data ?? [];
  }

  get yDomain(): string {
    const allValues = this.series.flatMap((s) => s.data.map((d) => d.y));
    const min = Math.floor(Math.min(...allValues));
    const max = Math.ceil(Math.max(...allValues));
    return `${min}..${max}`;
  }

  get yMin(): number {
    const allValues = this.series.flatMap((s) => s.data.map((d) => d.y));
    return Math.floor(Math.min(...allValues));
  }

  getValueAtX(series: Series, x: number): number | null {
    const point = series.data.find((d) => d.x === x);
    return point ? point.y : null;
  }

  chartWidth = (width: number | undefined): number => {
    return (width ?? 680) - 70;
  };

  gridLength = (width: number | undefined): number => {
    return (width ?? 680) - 70 - 50;
  };

  interactorWidth = (width: number | undefined): number => {
    return (width ?? 680) - 70 - 50;
  };

  chartBottom = (height: number | undefined): number => {
    return (height ?? 280) - 40;
  };

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Growth Metrics"}}</h3>
        {{#if this.activeX}}
          <div class="multiline-values">
            {{#each this.series as |s|}}
              <span class="multiline-value" style={{s.colorStyle}}>
                {{s.name}}:
                {{this.getValueAtX s this.activeX}}
              </span>
            {{/each}}
          </div>
        {{/if}}
      </div>
      <div class="chart-card__body chart-card__body--tall">
        <Fluid class="chart-fluid" as |width height|>
          <svg class="chart-svg">
            <defs>
              {{#each this.series as |s|}}
                <linearGradient
                  id="gradient-{{s.name}}"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stop-color={{s.color}} stop-opacity="0.2" />
                  <stop offset="100%" stop-color={{s.color}} stop-opacity="0" />
                </linearGradient>
              {{/each}}
            </defs>
            {{#let
              (scaleLinear
                range=(array 50 (this.chartWidth width)) domain="0..29"
              )
              (scaleLinear
                range=(array (this.chartBottom height) 20) domain=this.yDomain
              )
              as |xScale yScale|
            }}
              {{#if (and xScale.isValid yScale.isValid)}}
                <GridLines
                  @scale={{yScale}}
                  @direction={{Direction.Horizontal}}
                  @length={{this.gridLength width}}
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
                  @tickCount={{6}}
                  class="chart-axis"
                  transform="translate(0,{{this.chartBottom height}})"
                />
              {{/if}}
              {{#each this.series as |s|}}
                <Area
                  @data={{s.data}}
                  @xScale={{xScale}}
                  @yScale={{yScale}}
                  @x="x"
                  @y="y"
                  @y0={{this.yMin}}
                  @curve="monotoneX"
                  fill="url(#gradient-{{s.name}})"
                />
                <Line
                  @data={{s.data}}
                  @xScale={{xScale}}
                  @yScale={{yScale}}
                  @x="x"
                  @y="y"
                  @curve="monotoneX"
                  fill="transparent"
                  stroke={{s.color}}
                  stroke-width="2.5"
                />
              {{/each}}
              {{#if (and xScale.isValid yScale.isValid)}}
                {{#if this.activeX}}
                  <line
                    x1={{xScale.compute this.activeX}}
                    x2={{xScale.compute this.activeX}}
                    y1="20"
                    y2={{this.chartBottom height}}
                    stroke="#94a3b8"
                    stroke-width="1"
                    stroke-dasharray="4 4"
                  />
                  {{#each this.series as |s|}}
                    {{#let (this.getValueAtX s this.activeX) as |val|}}
                      {{#if val}}
                        <circle
                          cx={{xScale.compute this.activeX}}
                          cy={{yScale.compute val}}
                          r="5"
                          fill={{s.color}}
                          stroke="white"
                          stroke-width="2"
                        />
                      {{/if}}
                    {{/let}}
                  {{/each}}
                {{/if}}
              {{/if}}
              <rect
                x="50"
                y="0"
                width={{this.interactorWidth width}}
                height={{this.chartBottom height}}
                tabindex="0"
                fill="transparent"
                class="interactor"
                {{interactorCartesianHorizontal
                  data=this.firstSeriesData
                  xScale=xScale
                  x="x"
                  y="y"
                  onSeek=this.updateActiveX
                }}
              />
            {{/let}}
          </svg>
        </Fluid>
        <div class="chart-legend">
          {{#each this.series as |s|}}
            <span class="chart-legend__item">
              <span class="chart-legend__dot" style={{s.dotStyle}}></span>
              {{s.name}}
            </span>
          {{/each}}
        </div>
      </div>
    </div>
  </template>
}
