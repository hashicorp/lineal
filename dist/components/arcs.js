import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { pie } from 'd3-shape';
import { ScaleOrdinal } from '../utils/scale.js';
import { Encoding } from '../utils/encoding.js';
import CSSRange from '../utils/css-range.js';
import parseAngle from '../utils/parse-angle.js';
import Arc from './arc.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { n } from 'decorator-transforms/runtime-esm';

/**
 * Copyright IBM Corp. 2020, 2026
 */
class Arcs extends Component {
  get theta() {
    return new Encoding(this.args.theta);
  }
  static {
    n(this.prototype, "theta", [cached]);
  }
  get color() {
    if (this.args.color) return new Encoding(this.args.color);
    return undefined;
  }
  static {
    n(this.prototype, "color", [cached]);
  }
  get colorScale() {
    // colorScale can be specified as a complete scale
    if (this.args.colorScale instanceof Object) return this.args.colorScale;
    // Or it can be specified as a string provided to CSSRange
    return new ScaleOrdinal({
      domain: Array.from(new Set(this.args.data.map(this.color ? d => this.color?.accessor(d) : (_, i) => i))),
      range: new CSSRange(this.args.colorScale ?? 'lineal-arcs')
    });
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
    return parseAngle(this.args.padAngle ?? 0);
  }
  static {
    n(this.prototype, "padAngle", [cached]);
  }
  get arcs() {
    const generator = pie().startAngle(this.startAngle).endAngle(this.endAngle).padAngle(this.padAngle).value(this.theta.accessor).sortValues(null);
    // Initial dataset
    const arcsData = generator(this.args.data);
    // Augment with color classes or fills
    arcsData.forEach((d, index) => {
      const colorValue = this.colorScale.compute(this.color ? this.color.accessor(d.data) : index);
      if (this.useCSSClass) {
        d.cssClass = colorValue;
      } else {
        d.fill = colorValue;
      }
    });
    return arcsData;
  }
  static {
    n(this.prototype, "arcs", [cached]);
  }
  static {
    setComponentTemplate(precompileTemplate("{{#if (has-block)}}\n  {{yield this.arcs}}\n{{else}}\n  {{#each this.arcs as |arc|}}\n    <Arc @startAngle={{arc.startAngle}} @endAngle={{arc.endAngle}} @padAngle={{arc.padAngle}} @innerRadius={{@innerRadius}} @outerRadius={{@outerRadius}} @cornerRadius={{@cornerRadius}} class={{arc.cssClass}} fill={{arc.fill}} ...attributes />\n  {{/each}}\n{{/if}}", {
      strictMode: true,
      scope: () => ({
        Arc
      })
    }), this);
  }
}

export { Arcs as default };
//# sourceMappingURL=arcs.js.map
