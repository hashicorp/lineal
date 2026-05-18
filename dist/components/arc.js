import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { hash } from '@ember/helper';
import { arc } from 'd3-shape';
import parseAngle from '../utils/parse-angle.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { n } from 'decorator-transforms/runtime-esm';

/**
 * Copyright IBM Corp. 2020, 2026
 */
class Arc extends Component {
  get startAngle() {
    return parseAngle(this.args.startAngle ?? 0);
  }
  static {
    n(this.prototype, "startAngle", [cached]);
  }
  get endAngle() {
    return parseAngle(this.args.endAngle ?? Math.PI * 2);
  }
  static {
    n(this.prototype, "endAngle", [cached]);
  }
  get padAngle() {
    if (this.args.padAngle) return parseAngle(this.args.padAngle);
    return undefined;
  }
  static {
    n(this.prototype, "padAngle", [cached]);
  }
  get arc() {
    const innerRadius = typeof this.args.innerRadius === 'string' ? parseFloat(this.args.innerRadius) : this.args.innerRadius ?? 0;
    const outerRadius = typeof this.args.outerRadius === 'string' ? parseFloat(this.args.outerRadius) : this.args.outerRadius ?? 100;
    const cornerRadius = typeof this.args.cornerRadius === 'string' ? parseFloat(this.args.cornerRadius) : this.args.cornerRadius ?? 0;
    const padRadius = typeof this.args.padRadius === 'string' ? parseFloat(this.args.padRadius) : this.args.padRadius;
    let generator = arc().innerRadius(innerRadius).outerRadius(outerRadius).cornerRadius(cornerRadius).startAngle(this.startAngle).endAngle(this.endAngle);
    if (this.padAngle) {
      generator = generator.padAngle(this.padAngle);
    }
    if (padRadius !== undefined) {
      generator = generator.padRadius(padRadius);
    }
    return generator;
  }
  static {
    n(this.prototype, "arc", [cached]);
  }
  get d() {
    // @ts-expect-error: Bad type upstream
    return this.arc();
  }
  static {
    n(this.prototype, "d", [cached]);
  }
  get centroid() {
    // @ts-expect-error: Bad type upstream
    const [x, y] = this.arc.centroid();
    return {
      x,
      y
    };
  }
  static {
    n(this.prototype, "centroid", [cached]);
  }
  static {
    setComponentTemplate(precompileTemplate("<path d={{this.d}} ...attributes></path>\n{{yield (hash centroid=this.centroid)}}", {
      strictMode: true,
      scope: () => ({
        hash
      })
    }), this);
  }
}

export { Arc as default };
//# sourceMappingURL=arc.js.map
