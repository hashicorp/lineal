/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { and } from 'ember-truth-helpers';

import Axis, {
  Direction,
  Orientation,
} from '@lineal-viz/lineal/components/axis';
import GridLines from '@lineal-viz/lineal/components/grid-lines';
// HBars import removed - using direct rects
import scaleLinear from '@lineal-viz/lineal/helpers/scale-linear';
import scaleBand from '@lineal-viz/lineal/helpers/scale-band';

interface HorizontalBarDatum {
  label: string;
  value: number;
  color?: string;
}

interface HorizontalBarChartSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
    data?: HorizontalBarDatum[];
  };
}

export default class HorizontalBarChart extends Component<HorizontalBarChartSignature> {
  @cached
  get data(): HorizontalBarDatum[] {
    return (
      this.args.data ?? [
        { label: 'JavaScript', value: 89, color: '#f7df1e' },
        { label: 'TypeScript', value: 76, color: '#3178c6' },
        { label: 'Python', value: 68, color: '#3776ab' },
        { label: 'Rust', value: 52, color: '#dea584' },
        { label: 'Go', value: 45, color: '#00add8' },
        { label: 'Swift', value: 38, color: '#fa7343' },
      ]
    );
  }

  get labels() {
    return this.data.map((d) => d.label);
  }

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Language Popularity"}}</h3>
      </div>
      <div class="chart-card__body">
        <svg width="100%" height="280" viewBox="0 0 500 280" class="chart-svg">
          {{#let
            (scaleLinear range="120..480" domain="0..100")
            (scaleBand domain=this.labels range="20..260" padding=0.25)
            as |xScale yScale|
          }}
            {{#if (and xScale.isValid yScale.isValid)}}
              <GridLines
                @scale={{xScale}}
                @direction={{Direction.Vertical}}
                @length={{240}}
                @lineCount={{5}}
                class="chart-grid"
                transform="translate(0,20)"
              />
              <Axis
                @scale={{xScale}}
                @orientation={{Orientation.Top}}
                @tickCount={{5}}
                class="chart-axis"
                transform="translate(0,20)"
              />
              {{#each this.data as |d|}}
                <text
                  x="115"
                  y={{yScale.compute d.label}}
                  dy={{yScale.bandwidth}}
                  transform="translate(0,-{{yScale.bandwidth}})"
                  text-anchor="end"
                  dominant-baseline="middle"
                  class="h-bar-label"
                >{{d.label}}</text>
                {{#let (xScale.compute d.value) as |barEndX|}}
                  <rect
                    x="120"
                    y={{yScale.compute d.label}}
                    width={{sub barEndX 120}}
                    height={{yScale.bandwidth}}
                    fill={{if d.color d.color "#6366f1"}}
                    rx="4"
                  />
                  <text
                    x={{barEndX}}
                    y={{yScale.compute d.label}}
                    dx="8"
                    dy={{yScale.bandwidth}}
                    transform="translate(0,-{{yScale.bandwidth}})"
                    dominant-baseline="middle"
                    class="h-bar-value"
                  >{{d.value}}%</text>
                {{/let}}
              {{/each}}
            {{/if}}
          {{/let}}
        </svg>
      </div>
    </div>
  </template>
}

const sub = (a: number, b: number): number => a - b;
