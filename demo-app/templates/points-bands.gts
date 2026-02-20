/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import scaleLinear from '@lineal-viz/lineal/helpers/scale-linear';
import scalePoint from '@lineal-viz/lineal/helpers/scale-point';
import { and, lt } from 'ember-truth-helpers';
import GridLines from '@lineal-viz/lineal/components/grid-lines';
import Points from '@lineal-viz/lineal/components/points';
import Axis, {
  Direction,
  Orientation,
} from '@lineal-viz/lineal/components/axis';
import Bars from '@lineal-viz/lineal/components/bars';
import scaleSqrt from '@lineal-viz/lineal/helpers/scale-sqrt';
import scaleOrdinal from '@lineal-viz/lineal/helpers/scale-ordinal';
import scaleBand from '@lineal-viz/lineal/helpers/scale-band';
import cssRange from '@lineal-viz/lineal/helpers/css-range';
import fmt from '../helpers/fmt';

const rand = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

export default class LinesRoute extends Component {
  daysOfWeek = 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.split(
    ' ',
  );

  categories = '0-18 18-25 25-35 35-50 50-70 70+'.split(' ');

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

  get ageDemo() {
    return [
      { bracket: '0-18', value: 10 },
      { bracket: '18-25', value: 25 },
      { bracket: '25-35', value: 100 },
      { bracket: '35-50', value: 30 },
      { bracket: '50-70', value: 150 },
      { bracket: '70+', value: 40 },
    ];
  }

  <template>
    <h2>Points</h2>
    <svg height="300" width="800" class="no-overflow m-100">
      {{#let
        (scaleLinear domain="0..23" range="0..800")
        (scalePoint domain=this.daysOfWeek range="0..300")
        as |xScale yScale|
      }}
        {{#if (and xScale.isValid yScale.isValid)}}
          <GridLines
            @scale={{yScale}}
            @direction={{Direction.Horizontal}}
            @length={{800}}
          />
          <GridLines
            @scale={{xScale}}
            @direction={{Direction.Vertical}}
            @length={{300}}
          />
        {{/if}}
        <rect x="0" y="0" width="800" height="300" class="svg-border"></rect>
        <Points
          @data={{this.frequencyByDay}}
          @renderCircles={{true}}
          @x="hour"
          @y="day"
          @size="value"
          @color="day"
          @xScale={{xScale}}
          @yScale={{yScale}}
          @sizeScale={{scaleSqrt domain="1..25" range="5..25"}}
          @colorScale={{scaleOrdinal
            domain=this.daysOfWeek
            range=(cssRange "ordinal")
          }}
          class="svg-border-gray"
          as |points|
        >
          {{#each points as |p|}}
            <text
              class="plot-label"
              x={{p.x}}
              y={{p.y}}
              dy={{if (lt p.size 10) "-15"}}
            >{{fmt p.datum.value}}</text>
          {{/each}}
        </Points>
      {{/let}}
    </svg>

    <h2>Bars</h2>
    <svg height="300" width="800" class="no-overflow m-100">
      {{#let
        (scaleBand domain=this.categories range="0..800" padding=0.1)
        (scaleLinear range="0..300" domain="0..")
        (scaleLinear range="300..0" domain="0..")
        as |xScale hScale yScale|
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
            transform="translate(0,{{hScale.range.max}})"
          />
          <GridLines
            @scale={{yScale}}
            @direction={{Direction.Horizontal}}
            @length={{800}}
            stroke-dasharray="5 5"
          />
        {{/if}}
        <Bars
          @data={{this.ageDemo}}
          @x="bracket"
          @y="value"
          @height="value"
          @width={{xScale.bandwidth}}
          @xScale={{xScale}}
          @yScale={{yScale}}
          @heightScale={{hScale}}
          @borderRadius="40 40 0 0"
        />
      {{/let}}
    </svg>
  </template>
}
