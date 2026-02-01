/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import scaleLinear from '@lineal-viz/lineal/helpers/scale-linear';
import scaleBand from '@lineal-viz/lineal/helpers/scale-band';
import Area from '@lineal-viz/lineal/components/area';
import { hash } from '@ember/helper';
import { array } from '@ember/helper';
import { and } from 'ember-truth-helpers';
import Axis, {
  Direction,
  Orientation,
} from '@lineal-viz/lineal/components/axis';
import GridLines from '@lineal-viz/lineal/components/grid-lines';
import VBars from '@lineal-viz/lineal/components/v-bars';

export default class ArcsRoute extends Component {
  categories = '0-18 18-25 25-35 35-50 50-70 70+'.split(' ');

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
    <h2>Area</h2>
    <svg width="800" height="200">
      {{#let
        (scaleLinear range="15..785" domain="0..10")
        (scaleLinear range="190..10" domain="0..10")
        as |xScale yScale|
      }}
        <Area
          @data={{array (hash x=0 y=5 y0=3) (hash x=10 y=10 y0=0)}}
          @xScale={{xScale}}
          @yScale={{yScale}}
          @x="x"
          @y="y"
          @y0="y0"
          fill="#BADA55"
          stroke="black"
        />
      {{/let}}
    </svg>

    <h2>VBar &amp; HBar</h2>

    <svg height="300" width="800" class="no-overflow m-100">
      {{#let
        (scaleBand domain=this.categories range="0..800" padding=0.1)
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
            transform="translate(0,{{yScale.range.min}})"
          />
          <GridLines
            @scale={{yScale}}
            @direction={{Direction.Horizontal}}
            @length={{800}}
            stroke-dasharray="5 5"
          />
        {{/if}}
        <Area
          @data={{this.ageDemo}}
          @x="bracket"
          @y="value"
          @y0={{0}}
          @xScale={{xScale}}
          @yScale={{yScale}}
          class="mass-color"
        />
        <VBars
          @data={{this.ageDemo}}
          @x="bracket"
          @y="value"
          @y0={{0}}
          @width={{xScale.bandwidth}}
          @xScale={{xScale}}
          @yScale={{yScale}}
          class="accent-color"
        />
      {{/let}}
    </svg>
  </template>
}
