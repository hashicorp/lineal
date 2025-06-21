/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { array } from '@ember/helper';
import { and, eq } from 'ember-truth-helpers';
import { htmlSafe } from '@ember/template';

import Points from '@lineal-viz/lineal/components/points';
import Axis, {
  Direction,
  Orientation,
} from '@lineal-viz/lineal/components/axis';
import GridLines from '@lineal-viz/lineal/components/grid-lines';
import scaleLinear from '@lineal-viz/lineal/helpers/scale-linear';
import scaleSqrt from '@lineal-viz/lineal/helpers/scale-sqrt';
import scaleOrdinal from '@lineal-viz/lineal/helpers/scale-ordinal';

interface ScatterDatum {
  x: number;
  y: number;
  size: number;
  category: string;
}

interface ScatterPlotSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
  };
}

// Category styles are used in legend

const CATEGORY_STYLES: Record<string, ReturnType<typeof htmlSafe>> = {
  Tech: htmlSafe('background: #6366f1'),
  Finance: htmlSafe('background: #10b981'),
  Healthcare: htmlSafe('background: #f59e0b'),
  Retail: htmlSafe('background: #ef4444'),
};

const circleStyle = htmlSafe(
  'cursor: pointer; transition: opacity 0.15s ease;',
);
const pointsStyle = htmlSafe('cursor: pointer;');

export default class ScatterPlot extends Component<ScatterPlotSignature> {
  @tracked activeDatum: ScatterDatum | null = null;

  categories = ['Tech', 'Finance', 'Healthcare', 'Retail'];

  @cached
  get data(): ScatterDatum[] {
    const result: ScatterDatum[] = [];
    for (let i = 0; i < 40; i++) {
      const category =
        this.categories[Math.floor(Math.random() * this.categories.length)]!;
      result.push({
        x: Math.round(Math.random() * 100),
        y: Math.round(Math.random() * 100),
        size: Math.round(10 + Math.random() * 40),
        category,
      });
    }
    return result;
  }

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Market Analysis"}}</h3>
        {{#if this.activeDatum}}
          <div class="chart-card__value">
            <span class="chart-card__label">{{this.activeDatum.category}}</span>
            <span class="chart-card__amount">Size:
              {{this.activeDatum.size}}</span>
          </div>
        {{/if}}
      </div>
      <div class="chart-card__body">
        <svg width="100%" height="320" viewBox="0 0 600 320" class="chart-svg">
          {{#let
            (scaleLinear range="60..580" domain="0..100")
            (scaleLinear range="280..20" domain="0..100")
            as |xScale yScale|
          }}
            {{#if (and xScale.isValid yScale.isValid)}}
              <GridLines
                @scale={{yScale}}
                @direction={{Direction.Horizontal}}
                @length={{520}}
                @lineCount={{5}}
                class="chart-grid"
                transform="translate(60,0)"
              />
              <GridLines
                @scale={{xScale}}
                @direction={{Direction.Vertical}}
                @length={{260}}
                @lineCount={{5}}
                class="chart-grid"
                transform="translate(0,20)"
              />
              <Axis
                @scale={{yScale}}
                @orientation={{Orientation.Left}}
                @tickCount={{5}}
                class="chart-axis"
                transform="translate(60,0)"
              />
              <Axis
                @scale={{xScale}}
                @orientation={{Orientation.Bottom}}
                @tickCount={{5}}
                class="chart-axis"
                transform="translate(0,280)"
              />
            {{/if}}
            <Points
              @data={{this.data}}
              @x="x"
              @y="y"
              @size="size"
              @color="category"
              @xScale={{xScale}}
              @yScale={{yScale}}
              @sizeScale={{scaleSqrt domain="10..50" range="6..20"}}
              @colorScale={{scaleOrdinal
                domain=this.categories
                range=(array "#6366f1" "#10b981" "#f59e0b" "#ef4444")
              }}
              @renderCircles={{true}}
              opacity="0.7"
              style={{pointsStyle}}
              as |points|
            >
              {{#each points as |p|}}
                <circle
                  cx={{p.x}}
                  cy={{p.y}}
                  r={{p.size}}
                  fill={{p.fill}}
                  opacity={{if
                    this.activeDatum
                    (if (eq this.activeDatum p.datum) 1 0.3)
                    0.7
                  }}
                  style={{circleStyle}}
                  {{on "mouseenter" (fn (mut this.activeDatum) p.datum)}}
                  {{on "mouseleave" (fn (mut this.activeDatum) null)}}
                />
              {{/each}}
            </Points>
          {{/let}}
        </svg>
        <div class="chart-legend">
          {{#each this.categories as |cat|}}
            <span class="chart-legend__item">
              <span
                class="chart-legend__dot"
                style={{getStyle CATEGORY_STYLES cat}}
              ></span>
              {{cat}}
            </span>
          {{/each}}
        </div>
      </div>
    </div>
  </template>
}

function getStyle(
  obj: Record<string, ReturnType<typeof htmlSafe>>,
  key: string,
): ReturnType<typeof htmlSafe> {
  return obj[key] ?? htmlSafe('background: #888');
}
