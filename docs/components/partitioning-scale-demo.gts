/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { scheduleOnce } from '@ember/runloop';
import { Bounds } from '@lineal-viz/lineal';
import fmt from '~docs/helpers/fmt';

import type { Scale } from '@lineal-viz/lineal/utils/scale';

export interface PartitioningScaleDemoSignature {
  Args: {
    data: Array<{ x: number; y: number }>;
    scale: Scale;
  };

  Element: HTMLDivElement;
}

export default class PartitioningScaleDemo extends Component<PartitioningScaleDemoSignature> {
  @cached
  get scale() {
    const scale = this.args.scale;
    const domain = scale.domain as unknown;

    if (domain instanceof Bounds && !domain.isValid) {
      // eslint-disable-next-line ember/no-runloop
      scheduleOnce('afterRender', this, () => {
        domain.qualify(this.args.data, 'y');
      });
    }

    return scale;
  }

  <template>
    {{#if this.scale.isValid}}
      <div class="waffle-chart" ...attributes>
        {{#each @data as |d|}}
          <div class={{this.scale.compute d.y}}><span>{{fmt d.y}}</span></div>
        {{/each}}
      </div>
    {{/if}}
  </template>
}
