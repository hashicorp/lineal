/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { scheduleOnce } from '@ember/runloop';
import Bounds from '@lineal-viz/lineal/bounds';

export default class PartitioningScaleDemo extends Component {
  @cached get scale() {
    const scale = this.args.scale;

    if (scale.domain instanceof Bounds && !scale.domain.isValid) {
      // eslint-disable-next-line ember/no-incorrect-calls-with-inline-anonymous-functions
      scheduleOnce('afterRender', this, () => {
        scale.domain.qualify(this.args.data, 'y');
      });
    }

    return scale;
  }
}
