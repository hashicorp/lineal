/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { and, eq } from 'ember-truth-helpers';
import { htmlSafe } from '@ember/template';

import Axis, { Orientation } from '@lineal-viz/lineal/components/axis';
// scaleLinear not needed - using getColor method
import scaleBand from '@lineal-viz/lineal/helpers/scale-band';

interface HeatmapDatum {
  row: string;
  col: string;
  value: number;
}

interface HeatmapChartSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
  };
}

const rectStyle = htmlSafe('cursor: pointer; transition: opacity 0.15s ease;');

export default class HeatmapChart extends Component<HeatmapChartSignature> {
  @tracked activeDatum: HeatmapDatum | null = null;

  days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  hours = ['6am', '9am', '12pm', '3pm', '6pm', '9pm'];

  @cached
  get data(): HeatmapDatum[] {
    const result: HeatmapDatum[] = [];
    this.days.forEach((day) => {
      this.hours.forEach((hour) => {
        // Simulate activity patterns
        let baseValue = Math.random() * 50;
        // Higher activity on weekdays during work hours
        if (
          !['Sat', 'Sun'].includes(day) &&
          ['9am', '12pm', '3pm'].includes(hour)
        ) {
          baseValue += 40;
        }
        // Higher activity on weekends during afternoon
        if (
          ['Sat', 'Sun'].includes(day) &&
          ['12pm', '3pm', '6pm'].includes(hour)
        ) {
          baseValue += 30;
        }
        result.push({
          row: day,
          col: hour,
          value: Math.round(baseValue),
        });
      });
    });
    return result;
  }

  getColor(value: number): string {
    // Color interpolation from light to dark
    const intensity = value / 100;
    if (intensity < 0.25) return '#ddd6fe';
    if (intensity < 0.5) return '#a78bfa';
    if (intensity < 0.75) return '#7c3aed';
    return '#5b21b6';
  }

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Activity Heatmap"}}</h3>
        {{#if this.activeDatum}}
          <div class="chart-card__value">
            <span class="chart-card__label">{{this.activeDatum.row}}
              {{this.activeDatum.col}}</span>
            <span class="chart-card__amount">{{this.activeDatum.value}}
              sessions</span>
          </div>
        {{/if}}
      </div>
      <div class="chart-card__body">
        <svg width="100%" height="280" viewBox="0 0 500 280" class="chart-svg">
          {{#let
            (scaleBand domain=this.hours range="60..480" padding=0.08)
            (scaleBand domain=this.days range="20..250" padding=0.08)
            as |xScale yScale|
          }}
            {{#if (and xScale.isValid yScale.isValid)}}
              <Axis
                @scale={{xScale}}
                @orientation={{Orientation.Top}}
                @includeDomain={{false}}
                class="chart-axis"
                transform="translate(0,20)"
              />
              <Axis
                @scale={{yScale}}
                @orientation={{Orientation.Left}}
                @includeDomain={{false}}
                class="chart-axis"
                transform="translate(60,0)"
              />
              {{#each this.data as |d|}}
                <rect
                  x={{xScale.compute d.col}}
                  y={{yScale.compute d.row}}
                  width={{xScale.bandwidth}}
                  height={{yScale.bandwidth}}
                  fill={{this.getColor d.value}}
                  rx="4"
                  opacity={{if
                    this.activeDatum
                    (if (eq this.activeDatum d) 1 0.5)
                    1
                  }}
                  style={{rectStyle}}
                  {{on "mouseenter" (fn (mut this.activeDatum) d)}}
                  {{on "mouseleave" (fn (mut this.activeDatum) null)}}
                />
              {{/each}}
            {{/if}}
          {{/let}}
        </svg>
        <div class="heatmap-legend">
          <span class="heatmap-legend__label">Low</span>
          <div class="heatmap-legend__gradient"></div>
          <span class="heatmap-legend__label">High</span>
        </div>
      </div>
    </div>
  </template>
}
