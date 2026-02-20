/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { and, eq } from 'ember-truth-helpers';

// VBars import removed - using direct rects
import Axis, {
  Direction,
  Orientation,
} from '@lineal-viz/lineal/components/axis';
import GridLines from '@lineal-viz/lineal/components/grid-lines';
import scaleLinear from '@lineal-viz/lineal/helpers/scale-linear';
import scaleBand from '@lineal-viz/lineal/helpers/scale-band';

interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

interface BarChartSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
    data?: BarDatum[];
    color?: string;
  };
}

export default class BarChart extends Component<BarChartSignature> {
  @tracked activeBar: BarDatum | null = null;

  get color() {
    return this.args.color ?? '#6366f1';
  }

  @cached
  get data(): BarDatum[] {
    return (
      this.args.data ?? [
        { label: 'Jan', value: 42 },
        { label: 'Feb', value: 58 },
        { label: 'Mar', value: 35 },
        { label: 'Apr', value: 71 },
        { label: 'May', value: 52 },
        { label: 'Jun', value: 81 },
        { label: 'Jul', value: 68 },
        { label: 'Aug', value: 94 },
      ]
    );
  }

  get labels() {
    return this.data.map((d) => d.label);
  }

  get maxValue() {
    return Math.max(...this.data.map((d) => d.value)) * 1.1;
  }

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Monthly Trends"}}</h3>
        {{#if this.activeBar}}
          <div class="chart-card__value">
            <span class="chart-card__label">{{this.activeBar.label}}</span>
            <span class="chart-card__amount">{{this.activeBar.value}}</span>
          </div>
        {{/if}}
      </div>
      <div class="chart-card__body">
        <svg width="100%" height="280" viewBox="0 0 600 280" class="chart-svg">
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color={{this.color}} />
              <stop
                offset="100%"
                stop-color={{this.color}}
                stop-opacity="0.7"
              />
            </linearGradient>
          </defs>
          {{#let
            (scaleBand domain=this.labels range="50..580" padding=0.3)
            (scaleLinear range="240..20" domain=(concat "0.." this.maxValue))
            as |xScale yScale|
          }}
            {{#if (and xScale.isValid yScale.isValid)}}
              <GridLines
                @scale={{yScale}}
                @direction={{Direction.Horizontal}}
                @length={{530}}
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
                transform="translate(0,240)"
                class="chart-axis"
              />
            {{/if}}
            {{#each this.data as |d|}}
              {{#if (and xScale.isValid yScale.isValid)}}
                {{#let (yScale.compute d.value) as |barY|}}
                  <rect
                    x={{xScale.compute d.label}}
                    y={{barY}}
                    width={{xScale.bandwidth}}
                    height={{sub 240 barY}}
                    fill={{if
                      (eq this.activeBar d)
                      this.color
                      "url(#barGradient)"
                    }}
                    rx="4"
                    {{! template-lint-disable no-inline-styles }}
                    style="cursor: pointer; transition: fill 0.15s ease;"
                    {{on "mouseenter" (fn (mut this.activeBar) d)}}
                    {{on "mouseleave" (fn (mut this.activeBar) null)}}
                  />
                {{/let}}
              {{/if}}
            {{/each}}
          {{/let}}
        </svg>
      </div>
    </div>
  </template>
}

function concat(a: string, b: number): string {
  return `${a}${b}`;
}

const sub = (a: number, b: number): number => a - b;
