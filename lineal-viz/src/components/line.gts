/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { line } from 'd3-shape';

import { ScaleLinear } from '../utils/scale.ts';
import { Encoding } from '../utils/encoding.ts';
import { curveFor } from '../utils/curves.ts';
import { scaleFrom, qualifyScale } from '../utils/mark-utils.ts';

import type { Scale } from '../utils/scale.ts';
import type { Accessor } from '../utils/encoding.ts';
import type { CurveArgs } from '../utils/curves.ts';

export interface LineSignature {
  Args: {
    data: any[];
    x: Accessor;
    y: Accessor;
    xScale?: Scale;
    yScale?: Scale;
    curve?: string | CurveArgs;
    defined?: (d: any) => boolean;
  };

  Blocks: {
    default: [];
  };

  Element: SVGPathElement;
}

export default class Line extends Component<LineSignature> {
  @cached
  get x() {
    return new Encoding(this.args.x);
  }

  @cached
  get y() {
    return new Encoding(this.args.y);
  }

  @cached
  get xScale() {
    const scale = scaleFrom(this.args.x, this.args.xScale) || new ScaleLinear();
    qualifyScale(this, scale, this.x, 'x');
    return scale;
  }

  @cached
  get yScale() {
    const scale = scaleFrom(this.args.y, this.args.yScale) || new ScaleLinear();
    qualifyScale(this, scale, this.y, 'y');
    return scale;
  }

  @cached
  get curve() {
    return curveFor(this.args.curve);
  }

  @cached
  get d() {
    if (!this.xScale.isValid || !this.yScale.isValid) return '';

    const generator = line()
      .curve(this.curve)
      .defined(
        this.args.defined ||
          ((d) => this.y.accessor(d) != null && this.x.accessor(d) != null),
      )
      .x((d) => this.xScale.compute(this.x.accessor(d)))
      .y((d) => this.yScale.compute(this.y.accessor(d)));

    return generator(this.args.data);
  }

  <template>
    <path d={{this.d}} ...attributes></path>
  </template>
}
