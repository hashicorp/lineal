/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { and } from 'ember-truth-helpers';
import { energyMix } from '../utils/data/energy-mix';
import Stack from '@lineal-viz/lineal/transforms/stack';
import Area from '@lineal-viz/lineal/components/area';
import Axis, {
  Direction,
  Orientation,
} from '@lineal-viz/lineal/components/axis';
import GridLines from '@lineal-viz/lineal/components/grid-lines';
import VBars from '@lineal-viz/lineal/components/v-bars';
import HBars from '@lineal-viz/lineal/components/h-bars';
import scaleLinear from '@lineal-viz/lineal/helpers/scale-linear';
import stackV from '@lineal-viz/lineal/helpers/stack-v';
import stackH from '@lineal-viz/lineal/helpers/stack-h';
import scaleBand from '@lineal-viz/lineal/helpers/scale-band';
import interactorCartesianHorizontal from '@lineal-viz/lineal/modifiers/interactor-cartesian-horizontal';

import type {
  StackSeriesVertical,
  StackDatumVertical,
  KeyedStackDatumVertical,
} from '@lineal-viz/lineal/transforms/stack';

const rand = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

let d = 6;

interface ActiveStackSlice {
  datum: StackDatumVertical & { datum: { hour: number } };
  data: StackSeriesVertical[];
}

export default class StacksRoute extends Component {
  @tracked activePop = null;
  @tracked activeStackSlice: ActiveStackSlice | null = null;

  @tracked stacked = new Stack({
    data: this.newData,
    order: 'ascending',
    x: 'hour',
    y: 'value',
    z: 'day',
  });

  get stackedCategories() {
    return this.stacked.categories.join(', ');
  }

  get activeHour(): number {
    return this.activeStackSlice?.datum.datum.hour ?? 0;
  }

  get activeSliceData(): { hour: number; value: number; day: string }[] {
    if (!this.activeStackSlice) return [];
    return this.activeStackSlice.data
      .map((d) => d[0]?.data as { hour: number; value: number; day: string })
      .filter(Boolean);
  }

  // Returns the stacked slice data as vertical keyed stack datums for use in templates
  get activeStackedSlice(): KeyedStackDatumVertical[] {
    if (!this.activeStackSlice) return [];
    return this.stacked.stack(
      this.activeSliceData,
    ) as KeyedStackDatumVertical[];
  }

  daysOfWeek = 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.split(
    ' ',
  );

  energyMix = Object.freeze(energyMix);

  @cached
  get g20() {
    return Array.from(new Set(this.energyMix.map((d) => d.region)));
  }

  @cached
  get g20ByConsumption() {
    const agg = this.energyMix.reduce(
      (hash: { [key: string]: any }, record) => {
        const region = hash[record.region] ?? {
          region: record.region,
          sum: 0,
        };
        region.sum += record.value;
        hash[record.region] = region;
        return hash;
      },
      {},
    );
    return this.g20.sort((a, b) => agg[b].sum - agg[a].sum);
  }

  @cached
  get divergingEnergyMix() {
    return this.energyMix.map((d) => {
      const value = ['Coal', 'Oil', 'Gas'].includes(d.source)
        ? -d.value
        : d.value;
      return { ...d, value };
    });
  }

  get frequencyByDay() {
    return [
      { day: 'Monday', hour: 9, value: rand(1, 20) },
      { day: 'Monday', hour: 10, value: rand(1, 20) },
      { day: 'Monday', hour: 11, value: rand(1, 20) },
      { day: 'Monday', hour: 12, value: rand(1, 20) },

      { day: 'Tuesday', hour: 11, value: rand(1, 20) },
      { day: 'Tuesday', hour: 12, value: rand(1, 20) },
      { day: 'Tuesday', hour: 14, value: rand(1, 20) },
      { day: 'Tuesday', hour: 18, value: rand(1, 20) },

      { day: 'Wednesday', hour: 11, value: rand(1, 20) },
      { day: 'Wednesday', hour: 12, value: rand(1, 20) },

      { day: 'Thursday', hour: 11, value: rand(1, 20) },
      { day: 'Thursday', hour: 12, value: rand(1, 20) },
      { day: 'Thursday', hour: 14, value: rand(1, 20) },
      { day: 'Thursday', hour: 15, value: rand(1, 20) },
      { day: 'Thursday', hour: 18, value: rand(1, 20) },

      { day: 'Friday', hour: 17, value: rand(1, 20) },

      { day: 'Sunday', hour: 0, value: rand(1, 20) },
      { day: 'Sunday', hour: 1, value: rand(1, 20) },
      { day: 'Sunday', hour: 2, value: rand(1, 20) },
      { day: 'Sunday', hour: 3, value: rand(1, 20) },
      { day: 'Sunday', hour: 4, value: rand(1, 20) },
    ];
  }

  @cached
  get paddedFrequencyByDay() {
    const freq = this.frequencyByDay;
    const data = [];
    for (const day of this.daysOfWeek) {
      for (let hour = 0; hour < 24; hour++) {
        data.push(
          freq.find((d) => d.day === day && d.hour === hour) || {
            day,
            hour,
            value: 2,
          },
        );
      }
    }
    return data;
  }

  @cached
  get newData() {
    return [
      { day: 'Sunday', hour: 0, value: 1 },
      { day: 'Sunday', hour: 1, value: 2 },
      { day: 'Sunday', hour: 2, value: 1 },
      { day: 'Sunday', hour: 3, value: 2 },
      { day: 'Sunday', hour: 4, value: 1 },
      { day: 'Sunday', hour: 5, value: 2 },

      { day: 'Monday', hour: 0, value: 1 },
      { day: 'Monday', hour: 1, value: 2 },
      { day: 'Monday', hour: 2, value: 3 },
      { day: 'Monday', hour: 3, value: 4 },
      { day: 'Monday', hour: 4, value: 5 },
      { day: 'Monday', hour: 5, value: 6 },

      { day: 'Tuesday', hour: 0, value: 5 },
      { day: 'Tuesday', hour: 1, value: 0 },
      { day: 'Tuesday', hour: 2, value: 5 },
      { day: 'Tuesday', hour: 3, value: 0 },
      { day: 'Tuesday', hour: 4, value: 10 },
      { day: 'Tuesday', hour: 5, value: 0 },
    ];
  }

  appendTestData = () => {
    const hour = ++d;
    this.stacked.dataIn = [
      ...this.stacked.dataIn,
      ...['Sunday', 'Monday', 'Tuesday'].map((day) => ({
        day,
        hour,
        value: Math.random() * 5 + 1,
      })),
    ];
  };

  updateActiveDataPop = (activeData: any) => {
    this.activePop = activeData;
  };

  updateActiveStackDatum = (activeData: any) => {
    this.activeStackSlice = activeData;
  };

  <template>
    <h2>Stacked Area</h2>
    <svg height="300" width="800" class="no-overflow m-100">
      {{#let
        (scaleLinear range="0..800" domain="..")
        (scaleLinear range="300..0" domain="0..")
        as |xScale yScale|
      }}
        {{#if (and xScale.isValid yScale.isValid)}}
          <Axis
            @scale={{yScale}}
            @orientation={{Orientation.Left}}
            @includeDomain={{false}}
          />
          <Axis
            @scale={{xScale}}
            @orientation={{Orientation.Bottom}}
            transform="translate(0,300)"
          />
          <GridLines
            @scale={{yScale}}
            @direction={{Direction.Horizontal}}
            @length={{800}}
            stroke-dasharray="5 5"
          />
        {{/if}}
        <Area
          @data={{this.paddedFrequencyByDay}}
          @curve="natural"
          @x="hour"
          @y="value"
          @color="day"
          @xScale={{xScale}}
          @yScale={{yScale}}
          @colorScale="ordinal"
        />
      {{/let}}
    </svg>

    <svg height="300" width="800" class="no-overflow m-100">
      {{#let
        (scaleLinear range="0..800" domain="..")
        (scaleLinear range="300..0" domain="0..")
        (stackV
          data=this.paddedFrequencyByDay
          x="hour"
          y="value"
          z="day"
          offset="diverging"
        )
        as |xScale yScale stacked|
      }}
        {{#if (and xScale.isValid yScale.isValid)}}
          <Axis
            @scale={{yScale}}
            @orientation={{Orientation.Left}}
            @includeDomain={{false}}
          />
          <Axis
            @scale={{xScale}}
            @orientation={{Orientation.Bottom}}
            transform="translate(0,300)"
          />
          <GridLines
            @scale={{yScale}}
            @direction={{Direction.Horizontal}}
            @length={{800}}
            stroke-dasharray="5 5"
          />
        {{/if}}
        <VBars
          @data={{stacked.data}}
          @x="x"
          @y="y"
          @width={{30}}
          @xScale={{xScale}}
          @yScale={{yScale}}
          @colorScale="ordinal"
        />
      {{/let}}
    </svg>

    <h2>Stacked Area 2</h2>
    <button type="button" {{on "click" this.appendTestData}}>Append</button>
    <p>{{this.stackedCategories}}</p>
    <svg height="300" width="800" class="no-overflow m-100">
      {{! (stack-y data=this.paddedFrequencyByDay x='hour' y='value' z='day') }}
      {{#let
        (scaleLinear range="0..800" domain="0..30")
        (scaleLinear range="300..0" domain="0..")
        this.stacked
        as |xScale yScale stacked|
      }}
        {{#if (and xScale.isValid yScale.isValid)}}
          <Axis
            @scale={{yScale}}
            @orientation="left"
            @includeDomain={{false}}
          />
          <Axis
            @scale={{xScale}}
            @orientation="bottom"
            transform="translate(0,300)"
          />
          <GridLines
            @scale={{yScale}}
            @direction="horizontal"
            @length="800"
            stroke-dasharray="5 5"
          />
        {{/if}}
        <Area
          @data={{stacked.data}}
          @x="x"
          @y="y"
          @xScale={{xScale}}
          @yScale={{yScale}}
          @colorScale="ordinal"
        />
        {{#if (and xScale.isValid yScale.isValid)}}
          {{#if this.activeStackSlice}}
            <g class="interaction-overlay">
              <line
                stroke="red"
                stroke-width="2"
                x1={{xScale.compute this.activeHour}}
                x2={{xScale.compute this.activeHour}}
                y1="0"
                y2="300"
              ></line>
              {{#each this.activeStackedSlice as |d|}}
                <circle
                  cx={{xScale.compute d.x}}
                  cy={{yScale.compute d.y}}
                  r="5"
                  fill="black"
                ></circle>
                <text
                  x={{xScale.compute d.x}}
                  y={{yScale.compute d.y}}
                  dx="10"
                  text-anchor="start"
                >{{d.key}}</text>
              {{/each}}
            </g>
          {{/if}}
        {{/if}}
        <rect
          x="0"
          y="0"
          width="800"
          height="300"
          tabindex="0"
          fill="transparent"
          class="interactor"
          {{interactorCartesianHorizontal
            data=stacked.dataIn
            xScale=xScale
            x="hour"
            y="value"
            onSeek=this.updateActiveStackDatum
          }}
        ></rect>
      {{/let}}
    </svg>

    <h2>Stacked Area 3</h2>
    <button type="button" {{on "click" this.appendTestData}}>Append</button>
    <p>{{this.stackedCategories}}</p>
    <svg height="300" width="800" class="no-overflow m-100">
      {{! (stack-y data=this.paddedFrequencyByDay x='hour' y='value' z='day') }}
      {{#let
        (scaleLinear range="0..800" domain="0..30")
        (scaleLinear range="300..0" domain="0..")
        (stackV data=this.newData order="ascending" x="hour" y="value" z="day")
        as |xScale yScale stacked|
      }}
        {{#if (and xScale.isValid yScale.isValid)}}
          <Axis
            @scale={{yScale}}
            @orientation={{Orientation.Left}}
            @includeDomain={{false}}
          />
          <Axis
            @scale={{xScale}}
            @orientation={{Orientation.Bottom}}
            transform="translate(0,300)"
          />
          <GridLines
            @scale={{yScale}}
            @direction={{Direction.Horizontal}}
            @length={{800}}
            stroke-dasharray="5 5"
          />
        {{/if}}
        <Area
          @data={{stacked.data}}
          @x="x"
          @y="y"
          @xScale={{xScale}}
          @yScale={{yScale}}
          @colorScale="ordinal"
        />
        {{#if (and xScale.isValid yScale.isValid)}}
          {{#if this.activeStackSlice}}
            <g class="interaction-overlay">
              <line
                stroke="red"
                stroke-width="2"
                x1={{xScale.compute this.activeHour}}
                x2={{xScale.compute this.activeHour}}
                y1="0"
                y2="300"
              ></line>
              {{#each this.activeStackedSlice as |d|}}
                <circle
                  cx={{xScale.compute d.x}}
                  cy={{yScale.compute d.y}}
                  r="5"
                  fill="black"
                ></circle>
                <text
                  x={{xScale.compute d.x}}
                  y={{yScale.compute d.y}}
                  dx="10"
                  text-anchor="start"
                >{{d.key}}</text>
              {{/each}}
            </g>
          {{/if}}
        {{/if}}
        <rect
          x="0"
          y="0"
          width="800"
          height="300"
          tabindex="0"
          fill="transparent"
          class="interactor"
          {{interactorCartesianHorizontal
            data=stacked.dataIn
            xScale=xScale
            x="hour"
            y="value"
            onSeek=this.updateActiveStackDatum
          }}
        ></rect>
      {{/let}}
    </svg>

    <h2>Stacked Bars, Energy Mix</h2>

    <svg height="300" width="800" class="no-overflow m-100">
      {{#let
        (scaleBand range="0..800" domain=this.g20ByConsumption)
        (scaleLinear range="300..0" domain="-80000..40000")
        (stackV
          data=this.divergingEnergyMix
          x="region"
          y="value"
          z="source"
          offset="diverging"
        )
        as |xScale yScale stacked|
      }}
        {{#if (and xScale.isValid yScale.isValid)}}
          <Axis
            @scale={{yScale}}
            @orientation={{Orientation.Left}}
            @includeDomain={{false}}
          />
          <Axis
            @scale={{xScale}}
            @orientation={{Orientation.Top}}
            @includeDomain={{false}}
            as |tick|
          >
            <text
              y={{tick.offset}}
              text-anchor="start"
              transform="rotate(-75)"
            >{{tick.label}}</text>
          </Axis>
          <GridLines
            @scale={{yScale}}
            @direction={{Direction.Horizontal}}
            @length={{800}}
            stroke-dasharray="5 5"
          />
        {{/if}}
        <VBars
          @data={{stacked.data}}
          @x="x"
          @y="y"
          @width={{30}}
          @xScale={{xScale}}
          @yScale={{yScale}}
          @colorScale="energy-mix"
          @borderRadius="10"
        />
      {{/let}}
    </svg>

    <svg height="800" width="500" class="no-overflow m-100">
      {{#let
        (scaleLinear range="0..500" domain="..")
        (scaleBand range="0..800" domain=this.g20ByConsumption)
        (stackH
          data=this.divergingEnergyMix
          x="value"
          y="region"
          z="source"
          offset="diverging"
        )
        as |xScale yScale stacked|
      }}
        {{#if (and xScale.isValid yScale.isValid)}}
          <Axis
            @scale={{yScale}}
            @orientation={{Orientation.Left}}
            @includeDomain={{false}}
          />
          <Axis
            @scale={{xScale}}
            @orientation={{Orientation.Top}}
            @tickCount={{5}}
          />
          <GridLines
            @scale={{xScale}}
            @direction={{Direction.Vertical}}
            @length={{800}}
            stroke-dasharray="5 5"
          />
        {{/if}}
        <HBars
          @data={{stacked.data}}
          @x="x"
          @y="y"
          @height={{30}}
          @xScale={{xScale}}
          @yScale={{yScale}}
          @colorScale="energy-mix"
        />
      {{/let}}
    </svg>
  </template>
}
