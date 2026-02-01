/**
 * Copyright IBM Corp. 2020, 2026
 */

import style from 'ember-style-modifier';

import type { TOC } from '@ember/component/template-only';
import type { Scale } from '@lineal-viz/lineal/scale';

export interface DivergingScaleDemoSignature {
  Element: HTMLDivElement;
  Args: {
    scale: Scale;
    data: { x: number }[];
  };
}

const DivergingScaleDemo: TOC<DivergingScaleDemoSignature> = <template>
  <div class="flex-grid" ...attributes>
    {{#each @data as |d|}}
      <div class="diverging-scale-datum">
        {{d.x}}
        <div {{style background-color=(@scale.compute d.x)}}></div>
      </div>
    {{/each}}
  </div>
</template>;

export default DivergingScaleDemo;
