/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { hash } from '@ember/helper';
import { fn } from '@ember/helper';
import { array } from '@ember/helper';
import { tracked } from '@glimmer/tracking';
import { roundedRect } from '@lineal-viz/lineal/utils/rounded-rect';
import Arcs from '@lineal-viz/lineal/components/arcs';
import Arc from '@lineal-viz/lineal/components/arc';
import { on } from '@ember/modifier';
import { eq } from 'ember-truth-helpers';

export default class ArcsRoute extends Component {
  @tracked activeDatum = null;

  logValue = (...args: any[]) => console.log(...args);

  rrect = (rect: string, radii: string) => {
    const [x, y, width, height] = rect.split(' ').map((d) => +d);
    const [topLeft, topRight, bottomLeft, bottomRight] = radii
      .split(' ')
      .map((d) => +d);
    return roundedRect(
      { x: x ?? 0, y: y ?? 0, width: width ?? 0, height: height ?? 0 },
      {
        topLeft: topLeft ?? 0,
        topRight: topRight ?? 0,
        bottomLeft: bottomLeft ?? 0,
        bottomRight: bottomRight ?? 0,
      },
      true,
    );
  };

  <template>
    <h2>Arcs</h2>

    <svg width="800" height="200">
      <g transform="translate(400 100)">
        <Arc
          @startAngle="90d"
          @endAngle="270d"
          @innerRadius={{50}}
          @outerRadius={{75}}
          fill="pink"
        />
      </g>
    </svg>

    <h2>Pie</h2>
    <svg width="400" height="400">
      <g transform="translate(200 200)">
        <Arcs
          @data={{array (hash v=1) (hash v=10) (hash v=4)}}
          @theta="v"
          @colorScale="reds"
          @outerRadius={{150}}
          @innerRadius={{100}}
          @padAngle="1d"
        />
      </g>
    </svg>

    <h2>Pie 2</h2>
    <svg width="400" height="400">
      <g transform="translate(200 200)">
        <Arcs
          @data={{array
            (hash v=1 c="red")
            (hash v=0 c="blue")
            (hash v=10 c="red")
            (hash v=4 c="fish")
          }}
          @theta="v"
          @startAngle="270d"
          @endAngle="450d"
          @color="c"
          @colorScale="reds"
          as |pie|
        >
          {{#each pie as |slice|}}
            <Arc
              @startAngle={{slice.startAngle}}
              @endAngle={{slice.endAngle}}
              @outerRadius={{150}}
              @innerRadius={{100}}
              stroke="white"
              stroke-width="2"
              opacity={{if
                this.activeDatum
                (if (eq slice.data this.activeDatum) 1 0.3)
                1
              }}
              class={{slice.cssClass}}
              {{on "mouseover" (fn (mut this.activeDatum) slice.data)}}
              {{on "click" (fn this.logValue slice)}}
              {{on "mouseout" (fn (mut this.activeDatum) null)}}
            />
          {{/each}}
        </Arcs>
      </g>
    </svg>

    <h2>Rounded corners</h2>
    {{! template-lint-disable no-inline-styles }}
    <svg width="500" height="500" style="overflow: visible">
      <path d={{this.rrect "0 0 100 100" "15 15 15 15"}} />
      <path d={{this.rrect "150 0 75 50" "50 50 40 40"}} />
    </svg>
  </template>
}
