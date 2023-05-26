/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { Accessor, Encoding } from '../../../encoding';
import { Scale, ScaleLinear } from '../../../scale';
import { qualifyScale, scaleFrom } from '../../../utils/mark-utils';
import { cssFourPropParse } from '../../../utils/css-four-prop-parse';
import { roundedRect } from '../../../utils/rounded-rect';

export interface BarsArgs {
  data: any[];
  x: Accessor;
  y: Accessor;
  width: Accessor;
  height: Accessor;
  xScale?: Scale;
  yScale?: Scale;
  widthScale?: Scale;
  heightScale?: Scale;
  borderRadius?: string;
}

export interface BarDatum {
  x: number;
  y: number;
  width: number;
  height: number;
  datum: any;
  d?: string;
}

export default class Bars extends Component<BarsArgs> {
  @cached get x() {
    return new Encoding(this.args.x);
  }

  @cached get y() {
    return new Encoding(this.args.y);
  }

  @cached get width() {
    return new Encoding(this.args.width);
  }

  @cached get height() {
    return new Encoding(this.args.height);
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

  @cached get heightScale() {
    const scale = scaleFrom(this.args.height, this.args.heightScale) || new ScaleLinear();
    qualifyScale(this, scale, this.height, 'height');
    return scale;
  }

  @cached get borderRadius() {
    if (this.args.borderRadius) return cssFourPropParse(this.args.borderRadius);
  }

  @cached get bars(): BarDatum[] {
    if (
      !this.xScale.isValid ||
      !this.yScale.isValid ||
      !this.widthScale.isValid ||
      !this.heightScale.isValid
    ) {
      return [];
    }

    const bars = this.args.data.map((d: any) => {
      const bar: BarDatum = {
        x: this.xScale.compute(this.x.accessor(d)),
        y: this.yScale.compute(this.y.accessor(d)),
        width: this.widthScale.compute(this.width.accessor(d)),
        height: this.heightScale.compute(this.height.accessor(d)),
        datum: d,
      };

      return bar;
    });

    const borderRadius = this.borderRadius;

    if (borderRadius) {
      const radii = {
        topLeft: borderRadius.top,
        topRight: borderRadius.right,
        bottomRight: borderRadius.bottom,
        bottomLeft: borderRadius.left,
      };

      bars.forEach((bar) => {
        bar.d = roundedRect(bar, radii, true);
      });
    }

    return bars;
  }
}
