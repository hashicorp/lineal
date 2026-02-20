import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { not, or } from 'ember-truth-helpers';
import { Encoding } from '../utils/encoding.js';
import { ScaleLinear, ScaleSqrt, ScaleOrdinal } from '../utils/scale.js';
import { scaleFrom, qualifyScale } from '../utils/mark-utils.js';
import CSSRange from '../utils/css-range.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { n } from 'decorator-transforms/runtime-esm';

/**
 * Copyright IBM Corp. 2020, 2026
 */
class Points extends Component {
  get x() {
    return new Encoding(this.args.x);
  }
  static {
    n(this.prototype, "x", [cached]);
  }
  get y() {
    return new Encoding(this.args.y);
  }
  static {
    n(this.prototype, "y", [cached]);
  }
  get size() {
    return new Encoding(this.args.size);
  }
  static {
    n(this.prototype, "size", [cached]);
  }
  get color() {
    if (this.args.color) return new Encoding(this.args.color);
    return undefined;
  }
  static {
    n(this.prototype, "color", [cached]);
  }
  get xScale() {
    const scale = scaleFrom(this.args.x, this.args.xScale) || new ScaleLinear();
    qualifyScale(this, scale, this.x, 'x');
    return scale;
  }
  static {
    n(this.prototype, "xScale", [cached]);
  }
  get yScale() {
    const scale = scaleFrom(this.args.y, this.args.yScale) || new ScaleLinear();
    qualifyScale(this, scale, this.y, 'y');
    return scale;
  }
  static {
    n(this.prototype, "yScale", [cached]);
  }
  get sizeScale() {
    const scale = scaleFrom(this.args.size, this.args.sizeScale) || new ScaleSqrt();
    qualifyScale(this, scale, this.size, 'size');
    return scale;
  }
  // When there is no color scale, don't color-code drawn points
  static {
    n(this.prototype, "sizeScale", [cached]);
  }
  get colorScale() {
    const scale = this.args.colorScale;
    if (scale && this.color) {
      if (scale instanceof Object) return scale;
      return new ScaleOrdinal({
        domain: Array.from(new Set(this.args.data.map(d => this.color?.accessor(d)))),
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
  get points() {
    if (!this.xScale.isValid || !this.yScale.isValid || !this.sizeScale.isValid) return [];
    return this.args.data.map(d => {
      const point = {
        x: this.xScale.compute(this.x.accessor(d)),
        y: this.yScale.compute(this.y.accessor(d)),
        size: this.sizeScale.compute(this.size.accessor(d)),
        datum: d
      };
      if (this.colorScale && this.color) {
        const colorValue = this.colorScale.compute(this.color.accessor(d));
        if (this.useCSSClass) {
          point.cssClass = colorValue;
        } else {
          point.fill = colorValue;
        }
      }
      return point;
    });
  }
  static {
    n(this.prototype, "points", [cached]);
  }
  static {
    setComponentTemplate(precompileTemplate("{{#if (or @renderCircles (not (has-block)))}}\n  {{#each this.points as |p|}}\n    <circle cx={{p.x}} cy={{p.y}} r={{p.size}} fill={{p.fill}} class={{p.cssClass}} ...attributes></circle>\n  {{/each}}\n{{/if}}\n\n{{#if (has-block)}}\n  {{yield this.points}}\n{{/if}}", {
      strictMode: true,
      scope: () => ({
        or,
        not
      })
    }), this);
  }
}

export { Points as default };
//# sourceMappingURL=points.js.map
