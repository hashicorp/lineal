/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { ScaleLinear } from '@lineal-viz/lineal/utils/scale';
import { extent } from 'd3-array';
import Fluid from '@lineal-viz/lineal/components/fluid';
import Axis, {
  Direction,
  Orientation,
} from '@lineal-viz/lineal/components/axis';
import GridLines from '@lineal-viz/lineal/components/grid-lines';
import Line from '@lineal-viz/lineal/components/line';
import Area from '@lineal-viz/lineal/components/area';
import scaleLinear from '@lineal-viz/lineal/helpers/scale-linear';
import { array } from '@ember/helper';
import { and } from 'ember-truth-helpers';
import interactorCartesianHorizontal from '@lineal-viz/lineal/modifiers/interactor-cartesian-horizontal';

interface LinesSignature {
  Args: {
    model?: any[];
  };
}

export default class LinesRoute extends Component<LinesSignature> {
  @tracked activeDatum: { year: number; people: number } | null = null;

  get model() {
    return this.args.model ?? [];
  }

  @cached
  get pXScale() {
    return new ScaleLinear({
      domain: extent(this.population, (d) => +d.year).map((d) => d ?? 0),
    });
  }

  @cached
  get pYScale() {
    return new ScaleLinear({
      domain: extent(this.population, (d) => d.people).map((d) => d ?? 0),
    });
  }

  @cached
  get population() {
    const data = this.model || [];
    const reduction = data.reduce((agg: any, record: any) => {
      agg[record.year] = agg[record.year]
        ? agg[record.year] + record.people
        : record.people;
      return agg;
    }, {});

    return Object.entries(reduction).map(([year, people]) => ({
      year: +year,
      people: people as number,
    }));
  }

  @cached
  get sine() {
    const data: { x: number; y?: number }[] = [];
    for (let x = 0; x < 50; x += Math.PI / 8) {
      data.push({ x, y: Math.sin(x) });
    }

    // Corrode some data
    for (let i = 0; i < 30; i++) {
      const datum = data[Math.floor(Math.random() * data.length)];
      if (datum) datum.y = undefined;
    }

    return data;
  }

  get sineFiltered(): { x: number; y: number }[] {
    return this.sine.filter(
      (d): d is { x: number; y: number } => d.y != undefined,
    );
  }

  updateActiveData = (activeData: any) => {
    this.activeDatum = activeData ? activeData.datum.datum : null;
  };

  <template>
    <h2>Can we break it?</h2>
    <div class="fluid-chart">
      <Fluid class="fluid-chart__plot" as |width height|>
        <svg class="fluid-chart__svg">
          {{#let
            (this.pXScale.derive range=(array 0 width))
            (this.pYScale.derive range=(array height 0))
            as |xScale yScale|
          }}
            {{#if (and xScale.isValid yScale.isValid)}}
              <Axis @scale={{yScale}} @orientation={{Orientation.Left}} />
              <Axis
                @scale={{xScale}}
                @orientation={{Orientation.Bottom}}
                transform="translate(0,{{height}})"
              />
              <GridLines
                @scale={{yScale}}
                @direction={{Direction.Horizontal}}
                @length={{width}}
                opacity="0.7"
              />
              <GridLines
                @scale={{xScale}}
                @direction={{Direction.Vertical}}
                @length={{height}}
                opacity="0.3"
              />
              {{#each this.population as |d|}}
                <circle
                  cx={{xScale.compute d.year}}
                  cy={{yScale.compute d.people}}
                  r="3"
                ></circle>
              {{/each}}
            {{/if}}
            <Line
              @data={{this.population}}
              @xScale={{xScale}}
              @yScale={{yScale}}
              @x="year"
              @y="people"
              @curve="natural"
              fill="transparent"
              stroke="black"
              stroke-width="2"
            />
          {{/let}}
        </svg>
      </Fluid>
    </div>

    <h2>Line</h2>
    <div class="fluid-chart">
      <Fluid class="fluid-chart__plot" as |width height|>
        <svg class="fluid-chart__svg">
          {{#let
            (this.pXScale.derive range=(array 0 width))
            (this.pYScale.derive range=(array height 0))
            as |xScale yScale|
          }}
            {{#if (and xScale.isValid yScale.isValid)}}
              <Axis
                @scale={{yScale}}
                @orientation={{Orientation.Left}}
                @tickValues={{array 20000000 100000000 200000000 280000000}}
              />
              <Axis
                @scale={{xScale}}
                @orientation={{Orientation.Bottom}}
                transform="translate(0,{{height}})"
              />
              <GridLines
                @scale={{yScale}}
                @lineValues={{array 20000000 100000000 200000000 280000000}}
                @direction={{Direction.Horizontal}}
                @length={{width}}
                stroke-dasharray="5 5"
                opacity="0.7"
              />
              <GridLines
                @scale={{xScale}}
                @direction={{Direction.Vertical}}
                @length={{height}}
                stroke-dasharray="5 5"
                opacity="0.3"
              />
              {{#each this.population as |d|}}
                <circle
                  cx={{xScale.compute d.year}}
                  cy={{yScale.compute d.people}}
                  r="3"
                ></circle>
              {{/each}}
            {{/if}}
            <Line
              @data={{this.population}}
              @xScale={{xScale}}
              @yScale={{yScale}}
              @x="year"
              @y="people"
              @curve="natural"
              fill="transparent"
              stroke="black"
              stroke-width="2"
            />
            <rect
              x="0"
              y="0"
              width={{width}}
              height={{height}}
              tabindex="0"
              fill="transparent"
              class="interactor"
              {{interactorCartesianHorizontal
                data=this.population
                xScale=xScale
                x="year"
                y="people"
                onSeek=this.updateActiveData
              }}
            ></rect>
            {{#if (and xScale.isValid yScale.isValid)}}
              {{#if this.activeDatum}}
                <g class="interaction-overlay">
                  <line
                    stroke="pink"
                    stroke-width="2"
                    x1={{xScale.compute this.activeDatum.year}}
                    x2={{xScale.compute this.activeDatum.year}}
                    y1="0"
                    y2={{height}}
                  ></line>
                  <circle
                    cx={{xScale.compute this.activeDatum.year}}
                    cy={{yScale.compute this.activeDatum.people}}
                    r="5"
                    fill="red"
                  ></circle>
                </g>
              {{/if}}
            {{/if}}
          {{/let}}
        </svg>
      </Fluid>
      <div>
        {{#if this.activeDatum}}
          <p><strong>Active Datum:</strong>
            {{this.activeDatum.year}}</p>
          <p><strong>Active Value:</strong>
            {{this.activeDatum.people}}</p>
        {{/if}}
      </div>
    </div>

    <h2>Line</h2>
    <svg width="800" height="200">
      {{#let
        (scaleLinear range="15..785") (scaleLinear range="190..10")
        as |xScale yScale|
      }}
        <Area
          @data={{this.sineFiltered}}
          @xScale={{xScale}}
          @yScale={{yScale}}
          @x="x"
          @y="y"
          @y0={{0}}
          fill="rgb(255 0 0 / 30%)"
          stroke-width="1"
        />
        <Line
          @data={{this.sine}}
          @xScale={{xScale}}
          @yScale={{yScale}}
          @x="x"
          @y="y"
          fill="transparent"
          stroke="black"
          stroke-width="2"
        />
        <Line
          @data={{this.sineFiltered}}
          @xScale={{xScale}}
          @yScale={{yScale}}
          @x="x"
          @y="y"
          stroke-dasharray="3 5"
          fill="transparent"
          stroke="black"
          stroke-width="1"
        />
        {{#if (and xScale.isValid yScale.isValid)}}
          {{#each this.sineFiltered as |d|}}
            <circle
              cx={{xScale.compute d.x}}
              cy={{yScale.compute d.y}}
              r="3"
            ></circle>
          {{/each}}
        {{/if}}
      {{/let}}
    </svg>
  </template>
}
