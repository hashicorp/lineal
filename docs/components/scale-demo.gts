/**
 * Copyright IBM Corp. 2020, 2026
 */

import { array } from '@ember/helper';
import { Fluid, GridLines, Axis, Points } from '@lineal-viz/lineal/components';

import type { TOC } from '@ember/component/template-only';
import type { Scale } from '@lineal-viz/lineal/utils/scale';

export interface ScaleDemoSignature {
  Element: HTMLDivElement;
  Args: {
    scale: Scale;
    data: Array<{ x: number }>;
  };
}

const ScaleDemo: TOC<ScaleDemoSignature> = <template>
  <div class="demo-chart-with-axes">
    <Fluid as |width|>
      {{#let (@scale.derive range=(array 0 width)) as |scale|}}
        <svg width="100%" height="20px" style="overflow:visible">
          {{#if scale.isValid}}
            <GridLines @direction="vertical" @scale={{scale}} @length={{20}} />
            <Axis
              @orientation="bottom"
              @scale={{scale}}
              transform="translate(0,20)"
            />
          {{/if}}
          <Points
            @data={{@data}}
            @x="x"
            @xScale={{scale}}
            @y={{10}}
            @size={{3}}
          />
        </svg>
      {{/let}}
    </Fluid>
  </div>
</template>;

export default ScaleDemo;
