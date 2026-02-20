import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { merge } from 'd3-array';
import { Encoding } from '../utils/encoding.js';
import { ScaleLinear, ScaleOrdinal } from '../utils/scale.js';
import { scaleFrom, qualifyScale } from '../utils/mark-utils.js';
import { cssFourPropParse } from '../utils/css-four-prop-parse.js';
import { roundedRect } from '../utils/rounded-rect.js';
import CSSRange from '../utils/css-range.js';
import Stack from '../transforms/stack.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { n } from 'decorator-transforms/runtime-esm';

/**
 * Copyright IBM Corp. 2020, 2026
 */
class Bars extends Component {
  get x() {
    return new Encoding(this.args.x ?? 'x');
  }
  static {
    n(this.prototype, "x", [cached]);
  }
  get x0() {
    if (this.args.x0) return new Encoding(this.args.x0);
    return undefined;
  }
  static {
    n(this.prototype, "x0", [cached]);
  }
  get y() {
    return new Encoding(this.args.y ?? 'y');
  }
  static {
    n(this.prototype, "y", [cached]);
  }
  get height() {
    return new Encoding(this.args.height);
  }
  static {
    n(this.prototype, "height", [cached]);
  }
  get color() {
    if (this.args.color) return new Encoding(this.args.color);
    return undefined;
  }
  static {
    n(this.prototype, "color", [cached]);
  }
  get xScale() {
    const scale = scaleFrom(this.args.x ?? 'x', this.args.xScale) || new ScaleLinear();
    if (this.isStacked) {
      const allXValues = merge(this.data).map(d => [d.x, d.x0]).flat();
      qualifyScale(this, scale, new Encoding(d => d), 'x', allXValues);
    } else {
      qualifyScale(this, scale, this.x, 'x');
    }
    return scale;
  }
  static {
    n(this.prototype, "xScale", [cached]);
  }
  get yScale() {
    const scale = scaleFrom(this.args.y ?? 'y', this.args.yScale) || new ScaleLinear();
    if (this.isStacked) {
      qualifyScale(this, scale, new Encoding('y'), 'y', merge(this.data));
    } else {
      qualifyScale(this, scale, this.y, 'y');
    }
    return scale;
  }
  static {
    n(this.prototype, "yScale", [cached]);
  }
  get heightScale() {
    const scale = scaleFrom(this.args.height, this.args.heightScale) || new ScaleLinear();
    qualifyScale(this, scale, this.height, 'height');
    return scale;
  }
  static {
    n(this.prototype, "heightScale", [cached]);
  }
  get isStacked() {
    return !!this.color || this.args.data[0] instanceof Array;
  }
  static {
    n(this.prototype, "isStacked", [cached]);
  }
  get categories() {
    if (this.isStacked) {
      return this.data.map(series => series.key);
    }
    return undefined;
  }
  static {
    n(this.prototype, "categories", [cached]);
  }
  get data() {
    // When data isn't stacked, pass through
    if (!this.isStacked) return this.args.data;
    // When data is already stacked, pass through
    if (this.args.data[0] instanceof Array) return this.args.data;
    // Finally, stack data that should be stacked but isn't yet
    return new Stack({
      x: this.args.x ?? 'x',
      y: this.args.y ?? 'y',
      z: this.args.color,
      data: this.args.data,
      direction: 'horizontal'
    }).data;
  }
  // When there is no color scale, don't color-code drawn points
  static {
    n(this.prototype, "data", [cached]);
  }
  get colorScale() {
    const scale = this.args.colorScale;
    if (scale && this.isStacked) {
      if (scale instanceof Object) return scale;
      return new ScaleOrdinal({
        domain: Array.from(this.categories ?? []),
        range: new CSSRange(scale)
      });
    }
    return undefined;
  }
  static {
    n(this.prototype, "colorScale", [cached]);
  }
  get useCSSClass() {
    return this.colorScale instanceof Object && this.colorScale.range instanceof CSSRange;
  }
  static {
    n(this.prototype, "useCSSClass", [cached]);
  }
  get borderRadius() {
    if (this.args.borderRadius) return cssFourPropParse(this.args.borderRadius);
    return undefined;
  }
  static {
    n(this.prototype, "borderRadius", [cached]);
  }
  get bars() {
    if (!this.xScale.isValid || !this.yScale.isValid || !this.heightScale.isValid) {
      return [];
    }
    const borderRadius = this.borderRadius;
    if (this.isStacked) {
      return this.data.map(series => {
        const idx = series.visualOrder;
        const barSeries = {
          bars: series.map(d => ({
            x: this.xScale.compute(d.x0),
            y: this.yScale.compute(d.y),
            width: this.xScale.compute(d.x) - this.xScale.compute(d.x0),
            height: this.heightScale.compute(this.height.accessor(d)),
            datum: d
          }))
        };
        if (borderRadius && (idx === 0 || idx === this.data.length - 1)) {
          const radii = {
            topLeft: borderRadius.top,
            topRight: borderRadius.right,
            bottomRight: borderRadius.bottom,
            bottomLeft: borderRadius.left
          };
          // When multi series, render top corners if first series,
          // or the bottom coners if last series.
          if (this.data.length > 1) {
            Object.assign(radii, idx === 0 ? {
              topRight: 0,
              bottomRight: 0
            } : {
              topLeft: 0,
              bottomLeft: 0
            });
          }
          barSeries.bars.forEach(bar => {
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
      const bars = this.args.data.map(d => ({
        x: this.xScale.compute(this.x.accessor(d)),
        y: this.yScale.compute(this.y.accessor(d)),
        height: this.heightScale.compute(this.height.accessor(d)),
        width: this.xScale.compute(this.x.accessor(d)) - this.xScale.compute(this.x0?.accessor(d) ?? 0),
        datum: d
      }));
      if (borderRadius) {
        const radii = {
          topLeft: borderRadius.top,
          topRight: borderRadius.right,
          bottomRight: borderRadius.bottom,
          bottomLeft: borderRadius.left
        };
        bars.forEach(bar => {
          bar.d = roundedRect(bar, radii, true);
        });
      }
      return bars;
    }
  }
  static {
    n(this.prototype, "bars", [cached]);
  }
  static {
    setComponentTemplate(precompileTemplate("{{#if this.isStacked}}\n  <g>\n    {{!-- @glint-expect-error --}}\n    {{#each this.bars as |series|}}\n      <g>\n        {{!-- @glint-expect-error --}}\n        {{#each series.bars as |b|}}\n          {{#if b.d}}\n            <path d={{b.d}} {{!-- @glint-expect-error --}} fill={{series.fill}} {{!-- @glint-expect-error --}} class={{series.cssClass}} ...attributes></path>\n          {{else}}\n            <rect x={{b.x}} y={{b.y}} width={{b.width}} height={{b.height}} {{!-- @glint-expect-error --}} fill={{series.fill}} {{!-- @glint-expect-error --}} class={{series.cssClass}} ...attributes></rect>\n          {{/if}}\n        {{/each}}\n      </g>\n    {{/each}}\n  </g>\n{{else}}\n  <g>\n    {{!-- @glint-expect-error --}}\n    {{#each this.bars as |b|}}\n      {{#if b.d}}\n        <path d={{b.d}} ...attributes></path>\n      {{else}}\n        <rect x={{b.x}} y={{b.y}} width={{b.width}} height={{b.height}} ...attributes></rect>\n      {{/if}}\n    {{/each}}\n  </g>\n{{/if}}", {
      strictMode: true
    }), this);
  }
}

export { Bars as default };
//# sourceMappingURL=h-bars.js.map
