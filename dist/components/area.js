import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { area } from 'd3-shape';
import { merge } from 'd3-array';
import { Encoding } from '../utils/encoding.js';
import { ScaleLinear, ScaleOrdinal } from '../utils/scale.js';
import { curveFor } from '../utils/curves.js';
import { scaleFrom, qualifyScale } from '../utils/mark-utils.js';
import CSSRange from '../utils/css-range.js';
import Stack from '../transforms/stack.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { n } from 'decorator-transforms/runtime-esm';

/**
 * Copyright IBM Corp. 2020, 2026
 */
class Area extends Component {
  get x() {
    return new Encoding(this.args.x ?? 'x');
  }
  static {
    n(this.prototype, "x", [cached]);
  }
  get y() {
    return new Encoding(this.args.y ?? 'y');
  }
  static {
    n(this.prototype, "y", [cached]);
  }
  get y0() {
    if (this.args.y0) return new Encoding(this.args.y0);
    return undefined;
  }
  static {
    n(this.prototype, "y0", [cached]);
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
      qualifyScale(this, scale, new Encoding('x'), 'x', merge(this.data));
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
  static {
    n(this.prototype, "yScale", [cached]);
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
  get isStacked() {
    return !!this.color || this.args.data[0] instanceof Array;
  }
  static {
    n(this.prototype, "isStacked", [cached]);
  }
  get data() {
    // When data isn't stacked, pass through
    if (!this.isStacked) return this.args.data;
    // When data is already stacked, pass through
    if (this.args.data[0] instanceof Array) return this.args.data;
    // Finally, stack data that should be stacked but isn't yet
    // At this point, we know this.args.color exists because isStacked is true
    // and data[0] is not an Array (we checked above)
    return new Stack({
      x: this.args.x ?? 'x',
      y: this.args.y ?? 'y',
      z: this.args.color,
      data: this.args.data
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
  get curve() {
    return curveFor(this.args.curve);
  }
  static {
    n(this.prototype, "curve", [cached]);
  }
  get d() {
    if (!this.xScale.isValid || !this.yScale.isValid) return '';
    if (this.isStacked) {
      const generator = area().curve(this.curve).x(d => this.xScale.compute(d.x)).y0(d => this.yScale.compute(d.y0)).y1(d => this.yScale.compute(d.y1));
      return this.data.map(series => {
        const d = {
          d: generator(series)
        };
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
      const generator = area().curve(this.curve).defined(this.args.defined || (d => this.y.accessor(d) != null && this.x.accessor(d) != null)).x(d => this.xScale.compute(this.x.accessor(d))).y0(d => this.yScale.compute(this.y0?.accessor(d) ?? 0)).y1(d => this.yScale.compute(this.y.accessor(d)));
      return generator(this.args.data);
    }
  }
  static {
    n(this.prototype, "d", [cached]);
  }
  static {
    setComponentTemplate(precompileTemplate("{{#if this.isStacked}}\n  <g>\n    {{!-- @glint-expect-error --}}\n    {{#each this.d as |d|}}\n      <path d={{d.d}} fill={{d.fill}} class={{d.cssClass}} ...attributes></path>\n    {{/each}}\n  </g>\n{{else}}\n  {{!-- @glint-expect-error --}}\n  <path d={{this.d}} ...attributes></path>\n{{/if}}", {
      strictMode: true
    }), this);
  }
}

export { Area as default };
//# sourceMappingURL=area.js.map
