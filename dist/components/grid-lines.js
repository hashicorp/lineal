import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { n } from 'decorator-transforms/runtime-esm';

/**
 * Copyright IBM Corp. 2020, 2026
 */
// Keep enum for backward compatibility
let Direction = /*#__PURE__*/function (Direction) {
  Direction["Vertical"] = "vertical";
  Direction["Horizontal"] = "horizontal";
  return Direction;
}({});
const DEFAULT_OFFSET = typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 0 : 0.5;
class GridLines extends Component {
  get lineValues() {
    return this.args.lineValues ?? null;
  }
  static {
    n(this.prototype, "lineValues", [cached]);
  }
  get lineCount() {
    return this.args.lineCount ?? null;
  }
  static {
    n(this.prototype, "lineCount", [cached]);
  }
  get offset() {
    return this.args.offset ?? DEFAULT_OFFSET;
  }
  static {
    n(this.prototype, "offset", [cached]);
  }
  get values() {
    if (this.lineValues) return this.lineValues;
    const scale = this.args.scale?.d3Scale;
    if (scale?.ticks) {
      return this.lineCount != null ? scale.ticks(this.lineCount) : scale.ticks();
    }
    return scale?.domain();
  }
  static {
    n(this.prototype, "values", [cached]);
  }
  get position() {
    const copy = this.args.scale.d3Scale.copy();
    if (copy.bandwidth) {
      let offset = Math.max(0, copy.bandwidth() - this.offset * 2) / 2;
      if (copy.round()) offset = Math.round(offset);
      return d => +copy(d) + offset;
    }
    return d => +copy(d);
  }
  static {
    n(this.prototype, "position", [cached]);
  }
  get lines() {
    const length = typeof this.args.length === 'string' ? parseFloat(this.args.length) : this.args.length;
    const {
      direction
    } = this.args;
    const {
      offset,
      position
    } = this;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    const isHorizontal = direction === Direction.Horizontal;
    return this.values.map(v => ({
      x1: isHorizontal ? 0 : position(v) + offset,
      x2: isHorizontal ? length : position(v) + offset,
      y1: isHorizontal ? position(v) + offset : 0,
      y2: isHorizontal ? position(v) + offset : length
    }));
  }
  static {
    n(this.prototype, "lines", [cached]);
  }
  static {
    setComponentTemplate(precompileTemplate("<g class=\"grid-lines\">\n  {{#each this.lines key=\"@index\" as |l|}}\n    <line stroke=\"currentColor\" x1={{l.x1}} x2={{l.x2}} y1={{l.y1}} y2={{l.y2}} ...attributes></line>\n  {{/each}}\n</g>", {
      strictMode: true
    }), this);
  }
}

export { Direction, GridLines as default };
//# sourceMappingURL=grid-lines.js.map
