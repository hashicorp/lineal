/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { array } from '@ember/helper';
import { and } from 'ember-truth-helpers';

import Fluid from '@lineal-viz/lineal/components/fluid';
import Line from '@lineal-viz/lineal/components/line';
import Area from '@lineal-viz/lineal/components/area';
import Axis, { Orientation } from '@lineal-viz/lineal/components/axis';
import scaleLinear from '@lineal-viz/lineal/helpers/scale-linear';
import interactorCartesianHorizontal from '@lineal-viz/lineal/modifiers/interactor-cartesian-horizontal';

interface StockChartSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
    color?: string;
  };
}

export default class StockChart extends Component<StockChartSignature> {
  @tracked activeDatum: { day: number; price: number } | null = null;

  get color() {
    return this.args.color ?? '#6366f1';
  }

  @cached
  get data() {
    const data = [];
    let price = 100;

    for (let i = 0; i < 90; i++) {
      price = Math.max(50, price + (Math.random() - 0.48) * 5);
      data.push({
        day: i,
        price: Math.round(price * 100) / 100,
      });
    }
    return data;
  }

  updateActive = (activeData: any) => {
    this.activeDatum = activeData ? activeData.datum.datum : null;
  };

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Stock Price"}}</h3>
        {{#if this.activeDatum}}
          <div class="chart-card__value">
            <span class="chart-card__label">Day {{this.activeDatum.day}}</span>
            <span class="chart-card__amount">${{this.activeDatum.price}}</span>
          </div>
        {{/if}}
      </div>
      <div class="chart-card__body chart-card__body--tall">
        <Fluid class="chart-fluid" as |width height|>
          <svg class="chart-svg">
            <defs>
              <clipPath id="chartClip">
                <rect
                  x="40"
                  y="0"
                  width={{if width width 660}}
                  height={{if height height 260}}
                />
              </clipPath>
              <linearGradient
                id="stockGradient-{{this.color}}"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stop-color={{this.color}}
                  stop-opacity="0.3"
                />
                <stop
                  offset="100%"
                  stop-color={{this.color}}
                  stop-opacity="0.02"
                />
              </linearGradient>
            </defs>
            {{#let
              (scaleLinear range=(array 40 (if width width 700)) domain="..")
              (scaleLinear range=(array (if height height 250) 20) domain="..")
              as |xScale yScale|
            }}
              {{! Y-axis }}
              {{#if (and xScale.isValid yScale.isValid)}}
                <Axis
                  @scale={{yScale}}
                  @orientation={{Orientation.Left}}
                  @tickCount={{5}}
                  class="chart-axis"
                  transform="translate(40,0)"
                />
              {{/if}}
              {{! Area fill }}
              <g clip-path="url(#chartClip)">
                <Area
                  @data={{this.data}}
                  @xScale={{xScale}}
                  @yScale={{yScale}}
                  @x="day"
                  @y="price"
                  @y0={{50}}
                  @curve="monotoneX"
                  fill="url(#stockGradient-{{this.color}})"
                />
              </g>
              <Line
                @data={{this.data}}
                @xScale={{xScale}}
                @yScale={{yScale}}
                @x="day"
                @y="price"
                @curve="monotoneX"
                fill="transparent"
                stroke={{this.color}}
                stroke-width="2.5"
              />
              <rect
                x="40"
                y="0"
                width={{if width width 660}}
                height={{if height height 250}}
                tabindex="0"
                fill="transparent"
                class="interactor"
                {{interactorCartesianHorizontal
                  data=this.data
                  xScale=xScale
                  x="day"
                  y="price"
                  onSeek=this.updateActive
                }}
              />
              {{#if (and xScale.isValid yScale.isValid)}}
                {{#if this.activeDatum}}
                  <g class="interaction-overlay">
                    <line
                      x1={{xScale.compute this.activeDatum.day}}
                      x2={{xScale.compute this.activeDatum.day}}
                      y1="20"
                      y2={{if height height 250}}
                      stroke={{this.color}}
                      stroke-width="1"
                      stroke-dasharray="4 4"
                    />
                    <circle
                      cx={{xScale.compute this.activeDatum.day}}
                      cy={{yScale.compute this.activeDatum.price}}
                      r="6"
                      fill={{this.color}}
                      stroke="white"
                      stroke-width="2"
                    />
                  </g>
                {{/if}}
              {{/if}}
            {{/let}}
          </svg>
        </Fluid>
      </div>
    </div>
  </template>
}
