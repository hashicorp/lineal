import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { line } from 'd3-shape';
import { ScaleLinear } from '../utils/scale.js';
import { Encoding } from '../utils/encoding.js';
import { curveFor } from '../utils/curves.js';
import { scaleFrom, qualifyScale } from '../utils/mark-utils.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { n } from 'decorator-transforms/runtime-esm';

/**
 * Copyright IBM Corp. 2020, 2026
 */
class Line extends Component {
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
  get curve() {
    return curveFor(this.args.curve);
  }
  static {
    n(this.prototype, "curve", [cached]);
  }
  get d() {
    if (!this.xScale.isValid || !this.yScale.isValid) return '';
    const generator = line().curve(this.curve).defined(this.args.defined || (d => this.y.accessor(d) != null && this.x.accessor(d) != null)).x(d => this.xScale.compute(this.x.accessor(d))).y(d => this.yScale.compute(this.y.accessor(d)));
    return generator(this.args.data);
  }
  static {
    n(this.prototype, "d", [cached]);
  }
  static {
    setComponentTemplate(precompileTemplate("<path d={{this.d}} ...attributes></path>", {
      strictMode: true
    }), this);
  }
}

export { Line as default };
//# sourceMappingURL=line.js.map
