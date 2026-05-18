import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { Encoding } from '../utils/encoding.js';
import { ScaleLinear } from '../utils/scale.js';
import { scaleFrom, qualifyScale } from '../utils/mark-utils.js';
import { cssFourPropParse } from '../utils/css-four-prop-parse.js';
import { roundedRect } from '../utils/rounded-rect.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { n } from 'decorator-transforms/runtime-esm';

/**
 * Copyright IBM Corp. 2020, 2026
 */
class Bars extends Component {
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
  get width() {
    return new Encoding(this.args.width);
  }
  static {
    n(this.prototype, "width", [cached]);
  }
  get height() {
    return new Encoding(this.args.height);
  }
  static {
    n(this.prototype, "height", [cached]);
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
  get widthScale() {
    const scale = scaleFrom(this.args.width, this.args.widthScale) || new ScaleLinear();
    qualifyScale(this, scale, this.width, 'width');
    return scale;
  }
  static {
    n(this.prototype, "widthScale", [cached]);
  }
  get heightScale() {
    const scale = scaleFrom(this.args.height, this.args.heightScale) || new ScaleLinear();
    qualifyScale(this, scale, this.height, 'height');
    return scale;
  }
  static {
    n(this.prototype, "heightScale", [cached]);
  }
  get borderRadius() {
    if (this.args.borderRadius) return cssFourPropParse(this.args.borderRadius);
    return undefined;
  }
  static {
    n(this.prototype, "borderRadius", [cached]);
  }
  get bars() {
    if (!this.xScale.isValid || !this.yScale.isValid || !this.widthScale.isValid || !this.heightScale.isValid) {
      return [];
    }
    const bars = this.args.data.map(d => {
      const bar = {
        x: this.xScale.compute(this.x.accessor(d)),
        y: this.yScale.compute(this.y.accessor(d)),
        width: this.widthScale.compute(this.width.accessor(d)),
        height: this.heightScale.compute(this.height.accessor(d)),
        datum: d
      };
      return bar;
    });
    const borderRadius = this.borderRadius;
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
  static {
    n(this.prototype, "bars", [cached]);
  }
  static {
    setComponentTemplate(precompileTemplate("{{#each this.bars as |b|}}\n  {{#if b.d}}\n    <path d={{b.d}} ...attributes></path>\n  {{else}}\n    <rect x={{b.x}} y={{b.y}} width={{b.width}} height={{b.height}} ...attributes></rect>\n  {{/if}}\n{{/each}}", {
      strictMode: true
    }), this);
  }
}

export { Bars as default };
//# sourceMappingURL=bars.js.map
