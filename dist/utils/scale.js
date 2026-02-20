import { tracked, cached } from '@glimmer/tracking';
import * as scales from 'd3-scale';
import Bounds from './bounds.js';
import CSSRange from './css-range.js';
import { g, i, n } from 'decorator-transforms/runtime-esm';

/**
 * Copyright IBM Corp. 2020, 2026
 */

const boundsFromArg = arg => {
  if (arg instanceof Bounds) return arg;
  return arg ? Bounds.parse(arg) : new Bounds();
};
class ScaleContinuous {
  static {
    g(this.prototype, "domain", [tracked]);
  }
  #domain = (i(this, "domain"), void 0);
  /** The bounds of the scale's data space. */
  static {
    g(this.prototype, "range", [tracked]);
  }
  #range = (i(this, "range"), void 0);
  /** The bounds of the scale's visual space. */
  static {
    g(this.prototype, "clamp", [tracked], function () {
      return false;
    });
  }
  #clamp = (i(this, "clamp"), void 0);
  /** When `true`, values outside the domain are clamped to the min and max of the range
   * instead of extrapolated beyond the domain's bounds. */
  static {
    g(this.prototype, "nice", [tracked], function () {
      return false;
    });
  }
  #nice = (i(this, "nice"), void 0);
  /** When `true`, domain bounds are rounded to nice numbers. */
  constructor({
    domain,
    range,
    clamp,
    nice
  } = {}) {
    this.domain = boundsFromArg(domain);
    this.range = boundsFromArg(range);
    this.clamp = clamp ?? false;
    this.nice = nice ?? false;
  }

  /**
   * The arguments for constructing a d3Scale instance, derived from the ScaleConfig.
   */
  get scaleArgs() {
    return [this.domain.bounds, this.range.bounds];
  }

  /**
   * The d3Scale instance without generic modifications like clamp and nice applied yet.
   */

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */

  /**
   * The final d3Scale used for computation.
   */
  get d3Scale() {
    const scale = this._d3Scale;
    if (this.clamp) scale.clamp(true);
    if (this.nice && typeof this.nice === 'number') {
      scale.nice(this.nice);
    } else if (this.nice) {
      scale.nice();
    }
    return scale;
  }
  static {
    n(this.prototype, "d3Scale", [cached]);
  }
  get commonCopyArgs() {
    return {
      domain: this.domain.copy(),
      range: this.range.copy(),
      clamp: this.clamp,
      nice: this.nice
    };
  }

  /**
   * Computes a range value from a domain value.
   */
  compute = value => {
    return this.d3Scale(value);
  };

  /**
   * Whether or not the Bounds for the domain and range are valid (i.e., have a valid
   * min and max value).
   */
  get isValid() {
    return this.domain.isValid && this.range.isValid;
  }

  /**
   * The default tick values for the scale. These are domain values, not range values.
   */
  get ticks() {
    return this.d3Scale.ticks();
  }
}

/**
 * A scale that maps a domain of values to a range of values on a linear curve.
 */
class ScaleLinear extends ScaleContinuous {
  get _d3Scale() {
    return scales.scaleLinear(...this.scaleArgs);
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleLinear(Object.assign(this.commonCopyArgs, options));
  };
}

/**
 * A scale that maps a domain of values to a range of values on a power curve.
 */
class ScalePow extends ScaleContinuous {
  static {
    g(this.prototype, "exponent", [tracked], function () {
      return 1;
    });
  }
  #exponent = (i(this, "exponent"), void 0);
  /** The exponent of the power scale (e.g., 10 results in 10, 100, 1000 while 2 results in 2, 4, 8, 16). */
  constructor(config) {
    super(config);
    this.exponent = config.exponent ?? 1;
  }
  get _d3Scale() {
    return scales.scalePow(...this.scaleArgs).exponent(this.exponent);
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScalePow(Object.assign(this.commonCopyArgs, {
      exponent: this.exponent
    }, options));
  };
}

/**
 * A scale that maps a domain of values to a range of values on a logarithmic curve.
 */
class ScaleLog extends ScaleContinuous {
  static {
    g(this.prototype, "base", [tracked], function () {
      return 10;
    });
  }
  #base = (i(this, "base"), void 0);
  /** The base of the log scale (e.g., e results in a natural log while 10 results in the common log). */
  constructor(config) {
    super(config);
    this.base = config.base ?? 10;
  }
  get _d3Scale() {
    return scales.scaleLog(...this.scaleArgs).base(this.base);
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleLog(Object.assign(this.commonCopyArgs, {
      base: this.base
    }, options));
  };
}

/**
 * A scale that maps a domain of values to a range of values on a square root curve.
 */
class ScaleSqrt extends ScaleContinuous {
  get _d3Scale() {
    return scales.scaleSqrt(...this.scaleArgs);
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleSqrt(Object.assign(this.commonCopyArgs, options));
  };
}

/**
 * A scale that maps a domain of values to a range of values on a symmetric logarithmic curve.
 */
class ScaleSymlog extends ScaleContinuous {
  get _d3Scale() {
    return scales.scaleSymlog(...this.scaleArgs);
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleSymlog(Object.assign(this.commonCopyArgs, options));
  };
}

/**
 * A scale that maps a domain of values to a range of values on a linear curve where the range
 * is internally squared (to encode on area instead of radius).
 */
class ScaleRadial extends ScaleContinuous {
  get _d3Scale() {
    return scales.scaleRadial(...this.scaleArgs);
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleRadial(Object.assign(this.commonCopyArgs, options));
  };
}
class AbstractScaleTime {
  static {
    g(this.prototype, "domain", [tracked]);
  }
  #domain = (i(this, "domain"), void 0);
  /** The bounds of the scale's data space. */
  static {
    g(this.prototype, "range", [tracked]);
  }
  #range = (i(this, "range"), void 0);
  /** The bounds of the scale's visual space. */
  static {
    g(this.prototype, "clamp", [tracked], function () {
      return false;
    });
  }
  #clamp = (i(this, "clamp"), void 0);
  /** When `true`, values outside the domain are clamped to the min and max of the range
   * instead of extrapolated beyond the domain's bounds. */
  static {
    g(this.prototype, "nice", [tracked], function () {
      return false;
    });
  }
  #nice = (i(this, "nice"), void 0);
  /** When `true`, domain bounds are rounded to nice numbers. */
  constructor({
    domain,
    range,
    clamp,
    nice
  } = {}) {
    if (domain instanceof Bounds) {
      this.domain = domain;
    } else {
      this.domain = domain ? new Bounds(domain) : new Bounds();
    }
    this.range = boundsFromArg(range);
    this.clamp = clamp ?? false;
    this.nice = nice ?? false;
  }

  /**
   * The arguments for constructing a d3Scale instance, derived from the `DateScaleConfig`.
   */
  get scaleArgs() {
    return [this.domain.bounds, this.range.bounds];
  }

  /**
   * The d3Scale instance without generic modifications like clamp and nice applied yet.
   */

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */

  get commonCopyArgs() {
    return {
      domain: this.domain.copy(),
      range: this.range.copy(),
      clamp: this.clamp,
      nice: this.nice
    };
  }

  /**
   * The final d3Scale used for computation.
   */
  get d3Scale() {
    const scale = this._d3Scale;
    if (this.clamp) scale.clamp(true);
    if (this.nice && typeof this.nice === 'number') {
      scale.nice(this.nice);
    } else if (this.nice) {
      scale.nice();
    }
    return scale;
  }

  /**
   * Computes a range value from a domain value.
   */
  static {
    n(this.prototype, "d3Scale", [cached]);
  }
  compute = value => {
    return this.d3Scale(value);
  };

  /**
   * Whether or not the Bounds for the domain and range are valid (i.e., have a valid
   * min and max value).
   */
  get isValid() {
    return this.domain.isValid && this.range.isValid;
  }

  /**
   * The default tick values for the scale. These are domain values, not range values.
   */
  get ticks() {
    return this.d3Scale.ticks();
  }
}

/**
 * A scale that maps a domain of date values to a range of values on linear curve.
 */
class ScaleTime extends AbstractScaleTime {
  get _d3Scale() {
    return scales.scaleTime(...this.scaleArgs);
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleTime(Object.assign(this.commonCopyArgs, options));
  };
}

/**
 * A `ScaleTime`, except the timezone is UTC instead of local.
 */
class ScaleUtc extends AbstractScaleTime {
  get _d3Scale() {
    return scales.scaleUtc(...this.scaleArgs);
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleTime(Object.assign(this.commonCopyArgs, options));
  };
}

/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * and then passes that number to a range interpolator.
 */
class ScaleDiverging {
  static {
    g(this.prototype, "domain", [tracked]);
  }
  #domain = (i(this, "domain"), void 0);
  /** The bounds of the scale's data space. Diverging scales have a three-number domain
   * representing [max-a, mid, max-b] */
  static {
    g(this.prototype, "range", [tracked]);
  }
  #range = (i(this, "range"), void 0);
  /** An interpolator that maps a value from -1-1 to a value in visual space.. */
  static {
    g(this.prototype, "clamp", [tracked], function () {
      return false;
    });
  }
  #clamp = (i(this, "clamp"), void 0);
  /** When `true`, values outside the domain are clamped to the min and max of the range
   * instead of extrapolated beyond the domain's bounds. */
  /** Diverging scales do not support `Bounds` and are therefore always valid. */
  isValid = true;

  /**
   * The underlying d3Scale function before setting parameters.
   */
  scaleFn = scales.scaleDiverging;
  constructor({
    domain,
    range,
    clamp
  }) {
    this.domain = domain;
    this.range = range;
    this.clamp = clamp ?? false;
  }

  /**
   * The final d3Scale used for computation.
   */
  get d3Scale() {
    const scale = this.scaleFn(this.range).domain(this.domain);
    if (this.clamp) scale.clamp(true);
    return scale;
  }
  static {
    n(this.prototype, "d3Scale", [cached]);
  }
  get copyArgs() {
    const [d1, d2, d3] = this.domain;
    return {
      domain: [d1, d2, d3],
      range: this.range,
      clamp: this.clamp
    };
  }

  /**
   * Computes a range value from a domain value.
   */
  compute = value => {
    return this.d3Scale(value);
  };

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleDiverging(Object.assign(this.copyArgs, options));
  };
}

/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a logarithmic curve and then passes that number to a range interpolator.
 */
class ScaleDivergingLog extends ScaleDiverging {
  static {
    g(this.prototype, "base", [tracked]);
  }
  #base = (i(this, "base"), void 0);
  scaleFn = scales.scaleDivergingLog;
  constructor(config) {
    super(config);
    this.base = config.base ?? 1;
  }
  get d3Scale() {
    // @ts-expect-error: Bad type upstream
    const scale = this.scaleFn(this.range).domain(this.domain).base(this.base);
    if (this.clamp) scale.clamp(true);
    return scale;
  }
  static {
    n(this.prototype, "d3Scale", [cached]);
  }
  get copyArgs() {
    const {
      base
    } = this;
    return Object.assign(super.copyArgs, {
      base
    });
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleDivergingLog(Object.assign(this.copyArgs, options));
  };
}

/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a power curve and then passes that number to a range interpolator.
 */
class ScaleDivergingPow extends ScaleDiverging {
  static {
    g(this.prototype, "exponent", [tracked]);
  }
  #exponent = (i(this, "exponent"), void 0);
  scaleFn = scales.scaleDivergingPow;
  constructor(config) {
    super(config);
    this.exponent = config.exponent ?? 1;
  }
  get d3Scale() {
    const scale = this.scaleFn(this.range).domain(this.domain)
    // @ts-expect-error: Bad type upstream
    .exponent(this.exponent);
    if (this.clamp) scale.clamp(true);
    return scale;
  }
  static {
    n(this.prototype, "d3Scale", [cached]);
  }
  get copyArgs() {
    const {
      exponent
    } = this;
    return Object.assign(super.copyArgs, {
      exponent
    });
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleDivergingPow(Object.assign(this.copyArgs, options));
  };
}

/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a square root curve and then passes that number to a range interpolator.
 */
class ScaleDivergingSqrt extends ScaleDiverging {
  scaleFn = scales.scaleDivergingSqrt;

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleDivergingSqrt(Object.assign(this.copyArgs, options));
  };
}

/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a symmetric log curve and then passes that number to a range interpolator.
 */
class ScaleDivergingSymlog extends ScaleDiverging {
  scaleFn = scales.scaleDivergingSymlog;

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleDivergingSymlog(Object.assign(this.copyArgs, options));
  };
}

/**
 * A scale that maps a domain of values to a discrete set of range values, with intervals portioned
 * by the range.
 */
class ScaleQuantize {
  static {
    g(this.prototype, "domain", [tracked]);
  }
  #domain = (i(this, "domain"), void 0);
  /** The extent of a dataset from which equal intervals are derived using the length
   * of the provided range to determine the interval count.  */
  static {
    g(this.prototype, "range", [tracked]);
  }
  #range = (i(this, "range"), void 0);
  /** The set of values for the scale's visual space. */
  static {
    g(this.prototype, "count", [tracked]);
  }
  #count = (i(this, "count"), void 0);
  /** When range is a CSSRange, this becomes the interval count. */
  constructor({
    domain,
    range,
    count
  }) {
    this.domain = boundsFromArg(domain);
    this.range = range;
    this.count = count;
  }

  /** Derived number and string arrays to be used to construct a scale (when the domain is a
   * {@link bounds.default | Bounds} or the range is a {@link css-range.default | CSSRange}). */
  get scaleArgs() {
    const domain = this.domain instanceof Bounds ? this.domain.bounds : this.domain;
    const range = this.range instanceof CSSRange ? this.range.spread(this.count ?? domain.length) : this.range;
    return [domain, range];
  }

  /**
   * The d3Scale used for computation.
   */
  get d3Scale() {
    const [domain, range] = this.scaleArgs;
    return scales.scaleQuantize(range).domain(domain);
  }

  /**
   * Computes a range value from a domain value.
   */
  static {
    n(this.prototype, "d3Scale", [cached]);
  }
  compute = value => {
    return this.d3Scale(value);
  };

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleQuantize(Object.assign({
      domain: this.domain.copy(),
      range: this.range instanceof CSSRange ? this.range.copy() : this.range.slice(),
      count: this.count
    }, options));
  };

  /**
   * Whether or not the Bounds for the domain and range are valid (i.e., have a valid
   * min and max value).
   */
  get isValid() {
    return this.domain.isValid;
  }

  /**
   * The default tick values for the scale. These are domain values, not range values.
   */
  get ticks() {
    return this.d3Scale.ticks();
  }
}

/**
 * A scale that maps a set of values to a discrete set of range values, with intervals portioned
 * by the frequency of values in the dataset.
 */
class ScaleQuantile {
  static {
    g(this.prototype, "domain", [tracked]);
  }
  #domain = (i(this, "domain"), void 0);
  /** The complete set of data form which equal frequency quantiles are derived using the
   * length of the provided range to dermine the interval count and the data itself to
   * determine interval size. */
  static {
    g(this.prototype, "range", [tracked]);
  }
  #range = (i(this, "range"), void 0);
  /** The set of values for the scale's visual space. */
  static {
    g(this.prototype, "count", [tracked]);
  }
  #count = (i(this, "count"), void 0);
  /** When range is a CSSRange, this becomes the interval count. */
  /** Quantile scales do not support `Bounds` and are therefore always valid. */
  isValid = true;
  constructor({
    domain,
    range,
    count
  }) {
    this.domain = domain;
    this.range = range;
    this.count = count;
  }

  /**
   * The d3Scale used for computation.
   */
  get d3Scale() {
    const range = this.range instanceof CSSRange ? this.range.spread(this.count ?? this.domain.length) : this.range;
    return scales.scaleQuantile(range).domain(this.domain);
  }

  /**
   * Computes a range value from a domain value.
   */
  static {
    n(this.prototype, "d3Scale", [cached]);
  }
  compute = value => {
    return this.d3Scale(value);
  };

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleQuantile(Object.assign({
      domain: this.domain.slice(),
      range: this.range instanceof CSSRange ? this.range.copy() : this.range.slice(),
      count: this.count
    }, options));
  };
}

/**
 * A scale that maps a set of values to a discrete set of range values, with intervals portioned
 * by the elements set in the domain.
 */
class ScaleThreshold {
  static {
    g(this.prototype, "domain", [tracked]);
  }
  #domain = (i(this, "domain"), void 0);
  /** The values that define the bucket points in a dataset. */
  static {
    g(this.prototype, "range", [tracked]);
  }
  #range = (i(this, "range"), void 0);
  /** The set of values for the scale's visual space. */
  /** Threshold scales do not support `Bounds` and are therefore always valid. */
  isValid = true;
  constructor({
    domain,
    range
  }) {
    this.domain = domain;
    this.range = range;
  }

  /**
   * The d3Scale used for computation.
   */
  get d3Scale() {
    const range = this.range instanceof CSSRange ? this.range.spread(this.domain.length + 1) : this.range;
    return scales.scaleThreshold(range).domain(this.domain);
  }

  /**
   * Computes a range value from a domain value.
   */
  static {
    n(this.prototype, "d3Scale", [cached]);
  }
  compute = value => {
    return this.d3Scale(value);
  };

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleThreshold(Object.assign({
      domain: this.domain.slice(),
      range: this.range instanceof CSSRange ? this.range.copy() : this.range.slice()
    }, options));
  };
}

/**
 * A scale that maps a discrete set of domain values to a discrete set of range values.
 */
class ScaleOrdinal {
  static {
    g(this.prototype, "domain", [tracked]);
  }
  #domain = (i(this, "domain"), void 0);
  /** The set of values for the scale's data space. */
  static {
    g(this.prototype, "range", [tracked]);
  }
  #range = (i(this, "range"), void 0);
  /** The set of values for the scale's visual space. */
  static {
    g(this.prototype, "unknown", [tracked]);
  }
  #unknown = (i(this, "unknown"), void 0);
  /** The value returned for input vaues that are not in the domain. */
  /** Threshold scales do not support `Bounds` and are therefore always valid. */
  isValid = true;
  constructor({
    domain,
    range,
    unknown
  }) {
    this.domain = domain || [];
    this.range = range;
    this.unknown = unknown;
  }

  /**
   * The d3Scale used for computation.
   */
  get d3Scale() {
    // TODO: Return to instanceof checks when https://github.com/ef4/ember-auto-import/pull/512 is released.
    const range = this.range.constructor.name === 'CSSRange' || this.range instanceof CSSRange ? this.range.spread(this.domain.length) : this.range;
    const scale = scales.scaleOrdinal(range).domain(this.domain);
    if (this.unknown != null) {
      scale.unknown(this.unknown);
    }
    return scale;
  }

  /**
   * Computes a range value from a domain value.
   */
  static {
    n(this.prototype, "d3Scale", [cached]);
  }
  compute = value => {
    return this.d3Scale(value);
  };

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleOrdinal(Object.assign({
      domain: this.domain.slice(),
      range: this.range instanceof CSSRange ? this.range.copy() : this.range.slice(),
      unknown: this.unknown
    }, options));
  };
}

/**
 * A scale with equivalent domains and ranges (like an identity function).
 */
class ScaleIdentity {
  static {
    g(this.prototype, "range", [tracked]);
  }
  #range = (i(this, "range"), void 0);
  /** The set of values for both the scale's data space and visual space. */
  /** Identity scales do not support `Bounds` and are therefore always valid. */
  isValid = true;
  constructor({
    range
  }) {
    this.range = range instanceof Array ? range : [range, range];
  }

  /**
   * The d3Scale used for computation.
   */
  get d3Scale() {
    return scales.scaleIdentity(this.range);
  }

  /** The set of values for the scale's data space. Since the range and domain are always equivalent,
   * this is here for Scale interface compatability. */
  static {
    n(this.prototype, "d3Scale", [cached]);
  }
  get domain() {
    return this.range;
  }

  /**
   * Computes a range value from a domain value.
   */
  static {
    n(this.prototype, "domain", [cached]);
  }
  compute = value => {
    return this.d3Scale(value);
  };

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleIdentity(Object.assign({
      range: this.range.slice()
    }, options));
  };

  /**
   * The default tick values for the scale. These are domain values, not range values.
   */
  get ticks() {
    return this.d3Scale.ticks();
  }
}

/**
 * A scale that maps a discrete set of domain values to a continuous range of values by dividing the
 * continuous range into steps that are divided between padding and band widths.
 */
class ScaleBand {
  static {
    g(this.prototype, "domain", [tracked]);
  }
  #domain = (i(this, "domain"), void 0);
  /** The discrete set of ordinal (or nominal) input data. */
  static {
    g(this.prototype, "range", [tracked]);
  }
  #range = (i(this, "range"), void 0);
  /** The bounds of the scale's visual space. */
  static {
    g(this.prototype, "round", [tracked], function () {
      return false;
    });
  }
  #round = (i(this, "round"), void 0);
  /** When `true`, ensures that `step` and `bandwidth` are integers. */
  static {
    g(this.prototype, "align", [tracked], function () {
      return 0.5;
    });
  }
  #align = (i(this, "align"), void 0);
  /** A number between 0 and 1 that specifies how the outer padding in the scale's
   * range is distributed. 0.5 represents centering bands in their range. */
  static {
    g(this.prototype, "paddingInner", [tracked], function () {
      return 0;
    });
  }
  #paddingInner = (i(this, "paddingInner"), void 0);
  /** A number between 0 and 1 that specifies how much spacing there is between bands
   * in proportion to band widths (e.g., when `padding` is 0.5, gaps and bands are
   * equal widths. */
  static {
    g(this.prototype, "paddingOuter", [tracked], function () {
      return 0;
    });
  }
  #paddingOuter = (i(this, "paddingOuter"), void 0);
  /** A number between 0 and 1 that specifies how much padding is placed on the outside
   * of bands (while still subtracting available space from the `range`). */
  constructor({
    domain,
    range,
    round,
    align,
    paddingInner,
    paddingOuter,
    padding
  }) {
    this.domain = domain || [];
    this.range = boundsFromArg(range);
    this.round = round ?? false;
    this.align = align ?? 0.5;
    this.paddingInner = paddingInner ?? padding ?? 0;
    this.paddingOuter = paddingOuter ?? padding ?? 0;
  }

  /**
   * Whether or not the Bounds for the domain and range are valid (i.e., have a valid
   * min and max value).
   */
  get isValid() {
    return this.range.isValid;
  }

  /**
   * The final d3Scale used for computation.
   */
  get d3Scale() {
    const range = this.range instanceof Bounds ? this.range.bounds : this.range;
    return scales.scaleBand(range).domain(this.domain).round(this.round).align(this.align).paddingInner(this.paddingInner).paddingOuter(this.paddingOuter);
  }

  /**
   * Computes a range value from a domain value.
   */
  static {
    n(this.prototype, "d3Scale", [cached]);
  }
  compute = value => {
    return this.d3Scale(value);
  };

  /**
   * The width for a single band within the scale (this represents the width
   * of a bar in a traditional bar chart).
   */
  get bandwidth() {
    return this.d3Scale.bandwidth();
  }

  /**
   * The space bewteen two elements in the scale (this represents the width
   * of a bar + the padding between bars in a traditional bar chart).
   */
  get step() {
    return this.d3Scale.step();
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    const config = {
      domain: this.domain.slice(),
      range: this.range.copy(),
      align: this.align
    };
    if (this.paddingInner === this.paddingOuter) {
      config.padding = this.paddingInner;
    } else {
      config.paddingInner = this.paddingInner;
      config.paddingOuter = this.paddingOuter;
    }
    return new ScaleBand(Object.assign(config, options));
  };
}

/**
 * A scale that maps a discrete set of domain values to a continuous range of values by dividing the
 * continuous range into steps.
 */
class ScalePoint {
  static {
    g(this.prototype, "domain", [tracked]);
  }
  #domain = (i(this, "domain"), void 0);
  /** The discrete set of ordinal (or nominal) input data. */
  static {
    g(this.prototype, "range", [tracked]);
  }
  #range = (i(this, "range"), void 0);
  /** The bounds of the scale's visual space. */
  static {
    g(this.prototype, "round", [tracked], function () {
      return false;
    });
  }
  #round = (i(this, "round"), void 0);
  /** When `true`, ensures that `step` and `bandwidth` are integers. */
  static {
    g(this.prototype, "align", [tracked], function () {
      return 0.5;
    });
  }
  #align = (i(this, "align"), void 0);
  /** A number between 0 and 1 that specifies how the outer padding in the scale's
   * range is distributed. 0.5 represents centering bands in their range. */
  static {
    g(this.prototype, "padding", [tracked], function () {
      return 0;
    });
  }
  #padding = (i(this, "padding"), void 0);
  /** A number between 0 and 1 that specifies how much padding is placed on the outside
   * of the points (while still subtracting available space from the `range`). */
  constructor({
    domain,
    range,
    round,
    align,
    padding
  }) {
    this.domain = domain || [];
    this.range = boundsFromArg(range);
    this.round = round ?? false;
    this.align = align ?? 0.5;
    this.padding = padding ?? 0;
  }

  /**
   * Whether or not the Bounds for the domain and range are valid (i.e., have a valid
   * min and max value).
   */
  get isValid() {
    return this.range.isValid;
  }

  /**
   * The final d3Scale used for computation.
   */
  get d3Scale() {
    const range = this.range instanceof Bounds ? this.range.bounds : this.range;
    return scales.scalePoint(range).domain(this.domain).round(this.round).align(this.align).padding(this.padding);
  }
  static {
    n(this.prototype, "d3Scale", [cached]);
  }
  compute = value => {
    return this.d3Scale(value);
  };

  /**
   * Always returns `0`. It's here for d3 compatability (where point scales are a special form
   * of band scale).
   */
  get bandwidth() {
    // Always returns zero. It's here's for d3 compatability.
    return this.d3Scale.bandwidth();
  }

  /**
   * The space bewteen two elements in the scale (this represents the width
   * of a bar + the padding between bars in a traditional bar chart).
   */
  get step() {
    return this.d3Scale.step();
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = options => {
    return new ScaleBand(Object.assign({
      domain: this.domain.slice(),
      range: this.range.copy(),
      align: this.align,
      padding: this.padding
    }, options));
  };
}

export { ScaleBand, ScaleDiverging, ScaleDivergingLog, ScaleDivergingPow, ScaleDivergingSqrt, ScaleDivergingSymlog, ScaleIdentity, ScaleLinear, ScaleLog, ScaleOrdinal, ScalePoint, ScalePow, ScaleQuantile, ScaleQuantize, ScaleRadial, ScaleSqrt, ScaleSymlog, ScaleThreshold, ScaleTime, ScaleUtc };
//# sourceMappingURL=scale.js.map
