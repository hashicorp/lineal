/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { merge } from 'd3-array';
import { Accessor, Encoding } from '../../../encoding';
import { Scale, ScaleLinear, ScaleOrdinal } from '../../../scale';
import CSSRange from '../../../css-range';
import { qualifyScale, scaleFrom } from '../../../utils/mark-utils';
import Stack, { StackDatumHorizontal } from '../../../transforms/stack';

export interface BarsArgs {
  data: any[];
  x0: Accessor;
  x: Accessor;
  y: Accessor;
  height: Accessor;
  color: Accessor;
  xScale?: Scale;
  yScale?: Scale;
  heightScale?: Scale;
  colorScale?: Scale;
}

export interface BarDatum {
  x: number;
  y: number;
  width: number;
  height: number;
  datum: any;
}

export interface BarSeries {
  bars: BarDatum[];
  fill?: string;
  cssClass?: string;
}

export default class Bars extends Component<BarsArgs> {
  @cached get x() {
    return new Encoding(this.args.x);
  }

  @cached get x0() {
    return new Encoding(this.args.x0);
  }

  @cached get y() {
    return new Encoding(this.args.y);
  }

  @cached get height() {
    return new Encoding(this.args.height);
  }

  @cached get color() {
    if (this.args.color) return new Encoding(this.args.color);
  }

  @cached get xScale() {
    const scale = scaleFrom(this.args.x, this.args.xScale) || new ScaleLinear();
    if (this.isStacked) {
      const allXValues = merge(this.data)
        .map((d: any) => [d.x, d.x0])
        .flat();
      qualifyScale(this, scale, new Encoding((d) => d), 'x', allXValues);
    } else {
      qualifyScale(this, scale, this.x, 'x');
    }
    return scale;
  }

  @cached get yScale() {
    const scale = scaleFrom(this.args.y, this.args.yScale) || new ScaleLinear();
    if (this.isStacked) {
      qualifyScale(this, scale, new Encoding('y'), 'y', merge(this.data));
    } else {
      qualifyScale(this, scale, this.y, 'y');
    }
    return scale;
  }

  @cached get heightScale() {
    const scale = scaleFrom(this.args.height, this.args.heightScale) || new ScaleLinear();
    qualifyScale(this, scale, this.height, 'height');
    return scale;
  }

  @cached get isStacked(): boolean {
    return !!this.color || this.args.data[0] instanceof Array;
  }

  @cached get categories(): undefined | any[] {
    if (this.isStacked) {
      return this.data.map((series) => series.key);
    }
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
      direction: 'horizontal',
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

  @cached get bars(): BarDatum[] | BarSeries[] {
    if (!this.xScale.isValid || !this.yScale.isValid || !this.heightScale.isValid) {
      return [];
    }

    if (this.isStacked) {
      console.log(this.data);
      return this.data.map((series) => {
        const barSeries: BarSeries = {
          bars: series.map(
            (d: any): BarDatum => ({
              x: this.xScale.compute(d.x0),
              y: this.yScale.compute(d.y),
              width: this.xScale.compute(d.x) - this.xScale.compute(d.x0),
              height: this.heightScale.compute(this.height.accessor(d)),
              datum: d,
            })
          ),
        };

        if (this.colorScale) {
          const colorValue = this.colorScale.compute(series.key);
          if (this.useCSSClass) {
            barSeries.cssClass = colorValue;
          } else {
            barSeries.fill = colorValue;
          }
        }

        return barSeries;
      });
    } else {
      return this.args.data.map(
        (d: any): BarDatum => ({
          x: this.xScale.compute(this.x.accessor(d)),
          y: this.yScale.compute(this.y.accessor(d)),
          height: this.heightScale.compute(this.height.accessor(d)),
          width: this.xScale.compute(this.x.accessor(d)) - this.xScale.compute(this.x0.accessor(d)),
          datum: d,
        })
      );
    }
  }
}
