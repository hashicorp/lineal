import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { eq } from 'ember-truth-helpers';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { n } from 'decorator-transforms/runtime-esm';

/**
 * Copyright IBM Corp. 2020, 2026
 */
// Keep enums for backward compatibility
let Orientation = /*#__PURE__*/function (Orientation) {
  Orientation["Top"] = "top";
  Orientation["Right"] = "right";
  Orientation["Bottom"] = "bottom";
  Orientation["Left"] = "left";
  return Orientation;
}({});
// Internal numeric mapping for orientation comparisons
const OrientationInt = {
  top: 1,
  right: 2,
  bottom: 3,
  left: 4
};
let Direction = /*#__PURE__*/function (Direction) {
  Direction["Vertical"] = "vertical";
  Direction["Horizontal"] = "horizontal";
  return Direction;
}({});
const DEFAULT_OFFSET = typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 0 : 0.5;
const TEXT_OFFSET = {
  [OrientationInt.top]: '0em',
  [OrientationInt.right]: '0.32em',
  [OrientationInt.bottom]: '0.71em',
  [OrientationInt.left]: '0.32em'
};
const TEXT_ANCHOR = {
  [OrientationInt.top]: 'middle',
  [OrientationInt.right]: 'start',
  [OrientationInt.bottom]: 'middle',
  [OrientationInt.left]: 'end'
};
class Axis extends Component {
  get tickCount() {
    return this.args.tickCount ?? null;
  }
  static {
    n(this.prototype, "tickCount", [cached]);
  }
  get tickValues() {
    return this.args.tickValues ?? null;
  }
  static {
    n(this.prototype, "tickValues", [cached]);
  }
  get tickFormat() {
    return this.args.tickFormat ?? null;
  }
  static {
    n(this.prototype, "tickFormat", [cached]);
  }
  get tickSizeInner() {
    return this.args.tickSizeInner ?? this.args.tickSize ?? 6;
  }
  static {
    n(this.prototype, "tickSizeInner", [cached]);
  }
  get tickSizeOuter() {
    return this.args.tickSizeOuter ?? this.args.tickSize ?? 6;
  }
  static {
    n(this.prototype, "tickSizeOuter", [cached]);
  }
  get tickPadding() {
    return this.args.tickPadding ?? 3;
  }
  static {
    n(this.prototype, "tickPadding", [cached]);
  }
  get offset() {
    return this.args.offset ?? DEFAULT_OFFSET;
  }
  static {
    n(this.prototype, "offset", [cached]);
  }
  get includeDomain() {
    return this.args.includeDomain ?? true;
  }
  get orientation() {
    return OrientationInt[this.args.orientation];
  }
  static {
    n(this.prototype, "orientation", [cached]);
  }
  get direction() {
    return this.orientation === OrientationInt.left || this.orientation === OrientationInt.right ? 'vertical' : 'horizontal';
  }
  static {
    n(this.prototype, "direction", [cached]);
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
  // This hints at the tick orientation top/left one way, bottom/right the other way
  static {
    n(this.prototype, "position", [cached]);
  }
  get k() {
    const orientation = this.orientation;
    return orientation === OrientationInt.top || orientation === OrientationInt.left ? -1 : 1;
  }
  static {
    n(this.prototype, "k", [cached]);
  }
  get domainPath() {
    const {
      tickSizeOuter,
      offset,
      k
    } = this;
    const range = this.args.scale.d3Scale.range();
    const range0 = range[0] + offset;
    const range1 = range[range.length - 1] + offset;
    if (this.direction === 'vertical') {
      return tickSizeOuter !== 0 ? `M${k * tickSizeOuter},${range0}H${offset}V${range1}H${k * tickSizeOuter}` : `M${offset},${range0}V${range1}`;
    }
    return tickSizeOuter !== 0 ? `M${range0},${k * tickSizeOuter}V${offset}H${range1}V${k * tickSizeOuter}` : `M${range0},${offset}H${range1}`;
  }
  static {
    n(this.prototype, "domainPath", [cached]);
  }
  get values() {
    if (this.tickValues) return this.tickValues;
    const scale = this.args.scale?.d3Scale;
    if (scale?.ticks) {
      return this.tickCount != null ? scale.ticks(this.tickCount) : scale.ticks();
    }
    return scale?.domain();
  }
  static {
    n(this.prototype, "values", [cached]);
  }
  get format() {
    if (this.tickFormat) return this.tickFormat;
    if (this.args.scale.d3Scale.tickFormat) return this.args.scale.d3Scale.tickFormat();
    return x => x;
  }
  static {
    n(this.prototype, "format", [cached]);
  }
  get spacing() {
    return Math.max(this.tickSizeInner, 0) + this.tickPadding;
  }
  static {
    n(this.prototype, "spacing", [cached]);
  }
  get ticks() {
    const {
      k,
      format,
      spacing,
      tickSizeInner,
      offset,
      position,
      direction,
      orientation
    } = this;
    return this.values.map(v => ({
      transform: direction === 'horizontal' ? `translate(${position(v) + offset},0)` : `translate(0,${position(v) + offset})`,
      size: k * tickSizeInner,
      offset: k * spacing,
      textOffset: TEXT_OFFSET[orientation],
      label: format(v),
      textAnchor: TEXT_ANCHOR[orientation],
      value: v
    }));
  }
  static {
    n(this.prototype, "ticks", [cached]);
  }
  static {
    setComponentTemplate(precompileTemplate("<svg>\n  <g class=\"axis\" ...attributes>\n    {{#if this.includeDomain}}\n      <path class=\"domain\" stroke=\"currentColor\" d={{this.domainPath}}></path>\n    {{/if}}\n\n    {{#if (eq this.direction \"horizontal\")}}\n\n      {{#each this.ticks key=\"@index\" as |tick index|}}\n        <g transform={{tick.transform}}>\n          {{#if (has-block)}}\n            {{yield tick index}}\n          {{else}}\n            <line stroke=\"currentColor\" y2={{tick.size}}></line>\n            {{#if tick.label}}\n              <text fill=\"currentColor\" y={{tick.offset}} dy={{tick.textOffset}} text-anchor={{tick.textAnchor}}>{{tick.label}}</text>\n            {{/if}}\n          {{/if}}\n        </g>\n      {{/each}}\n\n    {{else}}\n\n      {{#each this.ticks key=\"@index\" as |tick index|}}\n        <g transform={{tick.transform}}>\n          {{#if (has-block)}}\n            {{yield tick index}}\n          {{else}}\n            <line stroke=\"currentColor\" x2={{tick.size}}></line>\n            {{#if tick.label}}\n              <text fill=\"currentColor\" x={{tick.offset}} dy={{tick.textOffset}} text-anchor={{tick.textAnchor}}>{{tick.label}}</text>\n            {{/if}}\n          {{/if}}\n        </g>\n      {{/each}}\n\n    {{/if}}\n  </g>\n</svg>", {
      strictMode: true,
      scope: () => ({
        eq
      })
    }), this);
  }
}

export { Direction, Orientation, Axis as default };
//# sourceMappingURL=axis.js.map
