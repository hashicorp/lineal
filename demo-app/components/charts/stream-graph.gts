/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn, array } from '@ember/helper';
import { eq } from 'ember-truth-helpers';
import { htmlSafe } from '@ember/template';

import Fluid from '@lineal-viz/lineal/components/fluid';
import Area from '@lineal-viz/lineal/components/area';
import Axis, { Orientation } from '@lineal-viz/lineal/components/axis';
import scaleLinear from '@lineal-viz/lineal/helpers/scale-linear';

interface StreamGraphSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
  };
}

interface StreamData {
  week: number;
  value: number;
  y0: number;
}

interface ComputedSeries {
  name: string;
  color: string;
  data: StreamData[];
  dotStyle: ReturnType<typeof htmlSafe>;
}

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
const areaStyle = htmlSafe('cursor: pointer; transition: opacity 0.2s ease;');

export default class StreamGraph extends Component<StreamGraphSignature> {
  @tracked activeSeries: string | null = null;

  categories = ['Gaming', 'Music', 'News', 'Sports', 'Tech'];

  @cached
  get rawData(): Array<Record<string, number>> {
    const data = [];
    for (let week = 0; week < 12; week++) {
      const point: Record<string, number> = { week };
      this.categories.forEach((cat) => {
        point[cat] = Math.floor(20 + Math.random() * 40);
      });
      data.push(point);
    }
    return data;
  }

  @cached
  get series(): ComputedSeries[] {
    // Simple stacking: each series starts where the previous one ended
    const result: ComputedSeries[] = [];

    this.categories.forEach((cat, catIndex) => {
      const seriesData: StreamData[] = this.rawData.map((d, weekIndex) => {
        // Calculate the baseline (y0) by summing all previous categories
        let y0 = 0;
        for (let i = 0; i < catIndex; i++) {
          const catName = this.categories[i];
          const rowData = this.rawData[weekIndex];
          if (catName && rowData) {
            y0 += rowData[catName] ?? 0;
          }
        }
        return {
          week: d.week ?? 0,
          value: (d[cat] ?? 0) + y0, // y1 = y0 + current value
          y0,
        };
      });

      result.push({
        name: cat,
        color: COLORS[catIndex] ?? '#888',
        data: seriesData,
        dotStyle: htmlSafe(`background: ${COLORS[catIndex] ?? '#888'}`),
      });
    });

    return result;
  }

  get yMax(): number {
    // Max is the total height of all stacked values
    let max = 0;
    this.rawData.forEach((d) => {
      const total = this.categories.reduce(
        (sum, cat) => sum + (d[cat] ?? 0),
        0,
      );
      if (total > max) max = total;
    });
    return max;
  }

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Content Trends"}}</h3>
      </div>
      <div class="chart-card__body chart-card__body--tall">
        <Fluid class="chart-fluid" as |width height|>
          <svg class="chart-svg">
            {{#let
              (scaleLinear
                domain=(array 0 11) range=(array 60 (if width width 580))
              )
              (scaleLinear
                domain=(array 0 this.yMax)
                range=(array (if height height 250) 20)
              )
              as |xScale yScale|
            }}
              <Axis
                @scale={{yScale}}
                @orientation={{Orientation.Left}}
                @tickCount={{5}}
                class="chart-axis"
                transform="translate(55,0)"
              />
              <Axis
                @scale={{xScale}}
                @orientation={{Orientation.Bottom}}
                @tickCount={{6}}
                class="chart-axis"
                transform="translate(0,{{if height height 250}})"
              />

              {{#each this.series as |s|}}
                <Area
                  @data={{s.data}}
                  @xScale={{xScale}}
                  @yScale={{yScale}}
                  @x="week"
                  @y="value"
                  @y0="y0"
                  @curve="monotoneX"
                  fill={{s.color}}
                  opacity={{if
                    this.activeSeries
                    (if (eq this.activeSeries s.name) 0.9 0.3)
                    0.7
                  }}
                  style={{areaStyle}}
                  {{on "mouseenter" (fn (mut this.activeSeries) s.name)}}
                  {{on "mouseleave" (fn (mut this.activeSeries) null)}}
                />
              {{/each}}
            {{/let}}
          </svg>
        </Fluid>
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
