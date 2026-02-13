/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { merge } from 'd3-array';

import { Encoding } from '../utils/encoding.ts';
import { ScaleLinear, ScaleOrdinal } from '../utils/scale.ts';
import { qualifyScale, scaleFrom } from '../utils/mark-utils.ts';
import { cssFourPropParse } from '../utils/css-four-prop-parse.ts';
import { roundedRect } from '../utils/rounded-rect.ts';
import CSSRange from '../utils/css-range.ts';
import Stack from '../transforms/stack.ts';

import type { Accessor } from '../utils/encoding.ts';
import type { Scale } from '../utils/scale.ts';

export interface BarsSignature {
  Args: {
    data: any[];
    x0?: Accessor;
    x?: Accessor;
    y?: Accessor;
    height: Accessor;
    color?: Accessor;
    xScale?: Scale;
    yScale?: Scale;
    heightScale?: Scale;
    colorScale?: Scale | string;
    borderRadius?: string;
  };

  Blocks: {
    default: [];
  };

  Element: SVGGElement;
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

export default class Bars extends Component<BarsSignature> {
  @cached
  get x() {
    return new Encoding(this.args.x ?? 'x');
  }

  @cached
  get x0() {
    if (this.args.x0) return new Encoding(this.args.x0);
    return undefined;
  }

  @cached
  get y() {
    return new Encoding(this.args.y ?? 'y');
  }

  @cached
  get height() {
    return new Encoding(this.args.height);
  }

  @cached
  get color() {
    if (this.args.color) return new Encoding(this.args.color);

    return undefined;
  }

  @cached
  get xScale() {
    const scale =
      scaleFrom(this.args.x ?? 'x', this.args.xScale) || new ScaleLinear();
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

  @cached
  get yScale() {
    const scale =
      scaleFrom(this.args.y ?? 'y', this.args.yScale) || new ScaleLinear();
    if (this.isStacked) {
      qualifyScale(this, scale, new Encoding('y'), 'y', merge(this.data));
    } else {
      qualifyScale(this, scale, this.y, 'y');
    }
    return scale;
  }

  @cached
  get heightScale() {
    const scale =
      scaleFrom(this.args.height, this.args.heightScale) || new ScaleLinear();
    qualifyScale(this, scale, this.height, 'height');
    return scale;
  }

  @cached
  get isStacked(): boolean {
    return !!this.color || this.args.data[0] instanceof Array;
  }

  @cached
  get categories(): undefined | any[] {
    if (this.isStacked) {
      return this.data.map((series) => series.key);
    }

    return undefined;
  }

  @cached
  get data(): any[] {
    // When data isn't stacked, pass through
    if (!this.isStacked) return this.args.data;

    // When data is already stacked, pass through
    if (this.args.data[0] instanceof Array) return this.args.data;

    // Finally, stack data that should be stacked but isn't yet
    return new Stack({
      x: this.args.x ?? 'x',
      y: this.args.y ?? 'y',
      z: this.args.color!,
      data: this.args.data,
      direction: 'horizontal',
    }).data;
  }

  // When there is no color scale, don't color-code drawn points
  @cached
  get colorScale(): Scale | undefined {
    const scale = this.args.colorScale;
    if (scale && this.isStacked) {
      if (scale instanceof Object) return scale;

      return new ScaleOrdinal({
        domain: Array.from(this.categories ?? []),
        range: new CSSRange(scale),
      });
    }

    return undefined;
  }

  @cached
  get useCSSClass() {
    return (
      this.colorScale instanceof Object &&
      this.colorScale.range instanceof CSSRange
    );
  }

  @cached
  get borderRadius() {
    if (this.args.borderRadius) return cssFourPropParse(this.args.borderRadius);

    return undefined;
  }

  @cached
  get bars(): BarDatum[] | BarSeries[] {
    if (
      !this.xScale.isValid ||
      !this.yScale.isValid ||
      !this.heightScale.isValid
    ) {
      return [];
    }

    const borderRadius = this.borderRadius;

    if (this.isStacked) {
      return this.data.map((series) => {
        const idx = series.visualOrder;
        const barSeries: BarSeries = {
          bars: series.map(
            (d: any): BarDatum => ({
              x: this.xScale.compute(d.x0),
              y: this.yScale.compute(d.y),
              width: this.xScale.compute(d.x) - this.xScale.compute(d.x0),
              height: this.heightScale.compute(this.height.accessor(d)),
              datum: d,
            }),
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
              idx === 0
                ? { topRight: 0, bottomRight: 0 }
                : { topLeft: 0, bottomLeft: 0 },
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
          height: this.heightScale.compute(this.height.accessor(d)),
          width:
            this.xScale.compute(this.x.accessor(d)) -
            this.xScale.compute(this.x0?.accessor(d) ?? 0),
          datum: d,
        }),
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

  <template>
    {{#if this.isStacked}}
      <g>
        {{! @glint-expect-error }}
        {{#each this.bars as |series|}}
          <g>
            {{! @glint-expect-error }}
            {{#each series.bars as |b|}}
              {{#if b.d}}
                <path
                  d={{b.d}}
                  {{! @glint-expect-error }}
                  fill={{series.fill}}
                  {{! @glint-expect-error }}
                  class={{series.cssClass}}
                  ...attributes
                ></path>
              {{else}}
                <rect
                  x={{b.x}}
                  y={{b.y}}
                  width={{b.width}}
                  height={{b.height}}
                  {{! @glint-expect-error }}
                  fill={{series.fill}}
                  {{! @glint-expect-error }}
                  class={{series.cssClass}}
                  ...attributes
                ></rect>
              {{/if}}
            {{/each}}
          </g>
        {{/each}}
      </g>
    {{else}}
      <g>
        {{! @glint-expect-error }}
        {{#each this.bars as |b|}}
          {{#if b.d}}
            <path d={{b.d}} ...attributes></path>
          {{else}}
            <rect
              x={{b.x}}
              y={{b.y}}
              width={{b.width}}
              height={{b.height}}
              ...attributes
            ></rect>
          {{/if}}
        {{/each}}
      </g>
    {{/if}}
  </template>
}
