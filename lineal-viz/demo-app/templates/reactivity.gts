/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { ScaleTime } from '@lineal-viz/lineal/scale';
import scaleLinear from '@lineal-viz/lineal/helpers/scale-linear';
import { and } from 'ember-truth-helpers';
import Axis, {
  Direction,
  Orientation,
} from '@lineal-viz/lineal/components/axis';
import GridLines from '@lineal-viz/lineal/components/grid-lines';
import Line from '@lineal-viz/lineal/components/line';
import type Owner from '@ember/owner';

function* sine(length: number, start = 0) {
  let x = start;
  const max = start + length * 200;
  while (x < max) {
    yield { x: new Date(x), y: Math.sin(x) * 10 };
    x += 200;
  }
}

export default class LinesRoute extends Component {
  @tracked wave: any[] = [];
  @tracked xScale = new ScaleTime({ range: '0..800' });

  constructor(owner: Owner, args: any) {
    super(owner, args);
    setInterval(() => {
      this.wave = Array.from(sine(100, Date.now()));
      // This third argument isn't in Lineal. It's used to
      // force an update to the domain, since normally qualify
      // only does something if the min or max are still undefined
      //this.xScale.domain.qualify(this.wave, 'x', true);
    }, 100);
  }
  <template>
    <h2>Updating data </h2>
    {{#if this.wave.length}}
      <svg width="800" height="200" class="no-overflow m-100">
        {{#let (scaleLinear range="200..0") as |yScale|}}
          {{#if (and this.xScale.isValid yScale.isValid)}}
            <Axis
              @scale={{yScale}}
              @orientation={{Orientation.Left}}
              @includeDomain={{false}}
            />
            <Axis
              @scale={{this.xScale}}
              @orientation={{Orientation.Bottom}}
              transform="translate(0,200)"
            />
            <GridLines
              @scale={{yScale}}
              @direction={{Direction.Horizontal}}
              @length={{800}}
              stroke-dasharray="5 5"
            />
          {{/if}}
          <Line
            @data={{this.wave}}
            @xScale={{this.xScale}}
            @yScale={{yScale}}
            @x="x"
            @y="y"
            @curve="natural"
            stroke-width="1"
            fill="transparent"
            stroke="black"
          />
        {{/let}}
      </svg>
    {{/if}}
  </template>
}
