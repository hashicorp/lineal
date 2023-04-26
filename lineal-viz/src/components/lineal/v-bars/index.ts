/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { Accessor, Encoding } from '../../../encoding';
import { Scale, ScaleLinear } from '../../../scale';
import { qualifyScale, scaleFrom } from '../../../utils/mark-utils';

export interface BarsArgs {
  data: any[];
  x: Accessor;
  y0: Accessor;
  y: Accessor;
  width: Accessor;
  xScale?: Scale;
  yScale?: Scale;
  widthScale?: Scale;
}

export interface BarDatum {
  x: number;
  y: number;
  width: number;
  height: number;
  datum: any;
}

export default class Bars extends Component<BarsArgs> {
  @cached get x() {
    return new Encoding(this.args.x);
  }

  @cached get y() {
    return new Encoding(this.args.y);
  }

  @cached get y0() {
    return new Encoding(this.args.y0);
  }

  @cached get width() {
    return new Encoding(this.args.width);
  }

  @cached get xScale() {
    const scale = scaleFrom(this.args.x, this.args.xScale) || new ScaleLinear();
    qualifyScale(this, scale, this.x, 'x');
    return scale;
  }

  @cached get yScale() {
    const scale = scaleFrom(this.args.y, this.args.yScale) || new ScaleLinear();
    qualifyScale(this, scale, this.y, 'y');
    return scale;
  }

  @cached get widthScale() {
    const scale = scaleFrom(this.args.width, this.args.widthScale) || new ScaleLinear();
    qualifyScale(this, scale, this.width, 'width');
    return scale;
  }

  @cached get bars(): BarDatum[] {
    if (!this.xScale.isValid || !this.yScale.isValid || !this.widthScale.isValid) {
      return [];
    }

    return this.args.data.map((d: any) => {
      const bar: BarDatum = {
        x: this.xScale.compute(this.x.accessor(d)),
        y: this.yScale.compute(this.y.accessor(d)),
        width: this.widthScale.compute(this.width.accessor(d)),
        height: this.yScale.compute(this.y0.accessor(d)) - this.yScale.compute(this.y.accessor(d)),
        datum: d,
      };

      return bar;
    });
  }
}
