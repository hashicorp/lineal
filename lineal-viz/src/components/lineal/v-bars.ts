/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { merge } from 'd3-array';
import { Accessor, Encoding } from '../../encoding';
import { Scale, ScaleLinear, ScaleOrdinal } from '../../scale';
import CSSRange from '../../css-range';
import { qualifyScale, scaleFrom } from '../../utils/mark-utils';
import { cssFourPropParse } from '../../utils/css-four-prop-parse';
import { roundedRect } from '../../utils/rounded-rect';
import Stack from '../../transforms/stack';

export interface BarsArgs {
  data: any[];
  x: Accessor;
  y0: Accessor;
  y: Accessor;
  width: Accessor;
  color: Accessor;
  xScale?: Scale;
  yScale?: Scale;
  widthScale?: Scale;
  colorScale?: Scale;
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

export interface BarSeries {
  bars: BarDatum[];
  fill?: string;
  cssClass?: string;
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

  @cached get widthScale() {
    const scale = scaleFrom(this.args.width, this.args.widthScale) || new ScaleLinear();
    qualifyScale(this, scale, this.width, 'width');
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

  @cached get borderRadius() {
    if (this.args.borderRadius) return cssFourPropParse(this.args.borderRadius);
  }

  @cached get bars(): BarDatum[] | BarSeries[] {
    if (!this.xScale.isValid || !this.yScale.isValid || !this.widthScale.isValid) {
      return [];
    }

    const borderRadius = this.borderRadius;

    if (this.isStacked) {
      return this.data.map((series) => {
        const idx = series.visualOrder;
        const barSeries: BarSeries = {
          bars: series.map(
            (d: any): BarDatum => ({
              x: this.xScale.compute(d.x),
              y: this.yScale.compute(d.y),
              width: this.widthScale.compute(this.width.accessor(d)),
              height: this.yScale.compute(d.y0) - this.yScale.compute(d.y),
              datum: d,
            })
          ),
        };

        if (borderRadius && (idx === 0 || idx === this.data.length - 1)) {
          const radii = {
            topLeft: borderRadius.top,
            topRight: borderRadius.right,
            bottomRight: borderRadius.bottom,
            bottomLeft: borderRadius.left,
          };

          // When multi series, render top corners if first series,
          // or the bottom coners if last series.
          if (this.data.length > 1) {
            Object.assign(
              radii,
              idx === 0 ? { topLeft: 0, topRight: 0 } : { bottomLeft: 0, bottomRight: 0 }
            );
          }

          barSeries.bars.forEach((bar) => {
            bar.d = roundedRect(bar, radii, true);
          });
        }

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
      const bars = this.args.data.map(
        (d: any): BarDatum => ({
          x: this.xScale.compute(this.x.accessor(d)),
          y: this.yScale.compute(this.y.accessor(d)),
          width: this.widthScale.compute(this.width.accessor(d)),
          height:
            this.yScale.compute(this.y0.accessor(d)) - this.yScale.compute(this.y.accessor(d)),
          datum: d,
        })
      );

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
}
