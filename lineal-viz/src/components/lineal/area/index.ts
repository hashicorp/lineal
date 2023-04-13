/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { area, CurveFactory, SeriesPoint } from 'd3-shape';
import { merge } from 'd3-array';
import { Scale, ScaleLinear, ScaleOrdinal } from '../../../scale';
import { Accessor, Encoding } from '../../../encoding';
import CSSRange from '../../../css-range';
import { curveFor, CurveArgs } from '../../../utils/curves';
import { scaleFrom, qualifyScale } from '../../../utils/mark-utils';
import Stack, { StackDatumVertical } from '../../../transforms/stack';

type MaybeStackDatum = StackDatumVertical & SeriesPoint<any>;

export interface AreaArgs {
  data: any[];
  x: Accessor;
  y: Accessor;
  y0: Accessor;
  color: Accessor;
  xScale?: Scale;
  yScale?: Scale;
  colorScale?: Scale;
  curve?: string | CurveArgs;
  defined?: (d: any) => boolean;
}

export interface AreaSeries {
  d: string | null;
  fill?: string;
  cssClass?: string;
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

  @cached get color() {
    if (this.args.color) return new Encoding(this.args.color);
  }

  @cached get xScale() {
    const scale = scaleFrom(this.args.x, this.args.xScale) || new ScaleLinear();
    if (this.isStacked) {
      qualifyScale(this, scale, new Encoding('x'), 'x', merge(this.data));
    } else {
      qualifyScale(this, scale, this.x, 'x');
    }
    return scale;
  }

  @cached get yScale() {
    const scale = scaleFrom(this.args.y, this.args.yScale) || new ScaleLinear();

    // When the data is stacked, the scale must be qualified using the computed
    // stack data since the cumulative y-values for an x-value will be greater than
    // any individual y-value in the original dataset.
    if (this.isStacked) {
      qualifyScale(this, scale, new Encoding('y'), 'y', merge(this.data));
    } else {
      qualifyScale(this, scale, this.y, 'y');
    }
    return scale;
  }

  @cached get categories(): undefined | any[] {
    if (this.isStacked) {
      return this.data.map((series) => series.key);
    }
  }

  @cached get isStacked(): boolean {
    return !!this.color || this.args.data[0] instanceof Array;
  }

  @cached get data(): any[] {
    // When data isn't stacked, pass through
    if (!this.isStacked) return this.args.data;

    // When data is already stacked, pass through
    if (this.args.data[0] instanceof Array) return this.args.data;

    // Finally, stack data that should be stacked but isn't yet
    return new Stack({
      x: this.args.x,
      y: this.args.y,
      z: this.args.color,
      data: this.args.data,
    }).data;
  }

  // When there is no color scale, don't color-code drawn points
  @cached get colorScale(): Scale | undefined {
    const scale = this.args.colorScale;
    if (scale && this.isStacked) {
      if (scale instanceof Object) return scale;

      return new ScaleOrdinal({
        domain: Array.from(this.categories ?? []),
        range: new CSSRange(scale),
      });
    }
  }

  @cached get useCSSClass() {
    return this.colorScale instanceof Object && this.colorScale.range instanceof CSSRange;
  }

  @cached get curve(): CurveFactory {
    return curveFor(this.args.curve) as CurveFactory;
  }

  @cached get d() {
    if (!this.xScale.isValid || !this.yScale.isValid) return '';

    if (this.isStacked) {
      const generator = area<MaybeStackDatum>()
        .curve(this.curve)
        .x((d) => this.xScale.compute(d.x))
        .y0((d) => this.yScale.compute(d.y0))
        .y1((d) => this.yScale.compute(d.y1));

      return this.data.map((series) => {
        const d: AreaSeries = { d: generator(series) };
        if (this.colorScale) {
          const colorValue = this.colorScale.compute(series.key);
          if (this.useCSSClass) {
            d.cssClass = colorValue;
          } else {
            d.fill = colorValue;
          }
        }
        return d;
      });
    } else {
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
}
