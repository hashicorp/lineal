/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { scheduleOnce } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { cached } from '@glimmer/tracking';
import { area, CurveFactory } from 'd3-shape';
import { extent } from 'd3-array';
import { Scale, ScaleLinear } from '../../../scale';
import { Accessor, Encoding } from '../../../encoding';
import Bounds from '../../../bounds';
import { curveFor, CurveArgs } from '../../../utils/curves';
import { qualifyScale } from '../../../utils/mark-utils';

export interface AreaArgs {
  data: any[];
  x: Accessor;
  y: Accessor;
  y0: Accessor;
  xScale?: Scale;
  yScale?: Scale;
  curve?: string | CurveArgs;
  defined?: (d: any) => boolean;
}

export default class Area extends Component<AreaArgs> {
  @cached get x() {
    return new Encoding(this.args.x);
  }

  @cached get y() {
    return new Encoding(this.args.y);
  }

  @cached get y0() {
    return new Encoding(this.args.y0);
  }

  @cached get xScale() {
    const scale = this.args.xScale || new ScaleLinear();
    qualifyScale(this, scale, this.x, 'x');
    return scale;
  }

  @cached get yScale() {
    const scale = this.args.yScale || new ScaleLinear();
    qualifyScale(this, scale, this.y, 'y');
    return scale;
  }

  @cached get curve(): CurveFactory {
    return curveFor(this.args.curve) as CurveFactory;
  }

  @cached get d() {
    if (!this.xScale.isValid || !this.yScale.isValid) return '';

    const generator = area()
      .curve(this.curve)
      .defined(
        this.args.defined || ((d) => this.y.accessor(d) != null && this.x.accessor(d) != null)
      )
      .x((d) => this.xScale.compute(this.x.accessor(d)))
      .y0((d) => this.yScale.compute(this.y0.accessor(d)))
      .y1((d) => this.yScale.compute(this.y.accessor(d)));

    return generator(this.args.data);
  }
}
