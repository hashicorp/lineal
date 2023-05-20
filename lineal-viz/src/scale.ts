/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import 'ember-cached-decorator-polyfill';
import { tracked, cached } from '@glimmer/tracking';
import * as scales from 'd3-scale';
import Bounds from './bounds';
import CSSRange from './css-range';

// TODO: D3 scales are incredibly fluid, but we can
// still do a better job locking down these types.

/**
 * All Scales are Ember-friendly wrappers
 * around d3 scales.
 */
export interface Scale {
  /** The bounds of the scale's data space. */
  domain: any;
  /** The bounds of the scale's visual space. */
  range: any;
  /** The mapper from data space to visual space. */
  compute: (value: any) => any;
  /** The underlying D3 Scale instance. */
  d3Scale: any;
  /** Whether or not calling scale.compute will result in an error.
   * `isValid` is `false` when the scale's domain or range are unqualified. */
  isValid: boolean;
  /** Creates a new scale of the same type and same properties. The options Config overrides
   * any set properties (like `Object.assign`). */
  derive: (options: any) => Scale;
}

/**
 * A value set is either an array of numbers (a step-wise representation of a range)
 * or a string (parsed as Bounds range expression).
 */
export type ValueSet = number[] | string | Bounds<number>;

/**
 * Continuous scales map a continuous domain to a continuous range (e.g., Linear).
 */
export interface ContinuousScaleConfig {
  /** The bounds of the scale's data space. */
  domain?: ValueSet;
  /** The bounds of the scale's visual space. */
  range?: ValueSet;
  /** When `true`, values outside the domain are clamped to the min and max of the range
   * instead of extrapolated beyond the domain's bounds. */
  clamp?: boolean;
  /** When `true`, domain bounds are rounded to nice numbers. */
  nice?: boolean | number;
}

/**
 * Power scales are continuous scales with the additional property
 * of the exponent.
 */
export interface PowScaleConfig extends ContinuousScaleConfig {
  /** The exponent of the power scale (e.g., 10 results in 10, 100, 1000 while 2 results in 2, 4, 8, 16). */
  exponent?: number;
}

/**
 * Logarithmic scales are continuous scales with the addition property
 * of the log base.
 */
export interface LogScaleConfig extends ContinuousScaleConfig {
  /** The base of the log scale (e.g., e results in a natural log while 10 results in the common log). */
  base?: number;
}

/**
 * Date scales are like continuous scales, except the domain must be
 * an array of Dates, since Dates have complexity beyond numbers.
 */
export interface DateScaleConfig {
  /** The bounds of the scale's data space. */
  domain?: Date[] | Bounds<Date>;
  /** The bounds of the scale's visual space. */
  range?: ValueSet;
  /** When `true`, values outside the domain are clamped to the min and max of the range
   * instead of extrapolated beyond the domain's bounds. */
  clamp?: boolean;
  /** When `true`, domain bounds are rounded to nice numbers. */
  nice?: boolean | number;
}

/**
 * Diverging scales take a special three-number domain where the first and
 * last element represent the bounds and the middle element represents the
 * neutral base value.
 */
export interface DivergingScaleConfig {
  /** The bounds of the scale's data space. Diverging scales have a three-number domain
   * representing [max-a, mid, max-b] */
  domain: [number, number, number];
  /** An interpolator that maps a value from -1-1 to a value in visual space.. */
  range: (t: number) => any;
  /** When `true`, values outside the domain are clamped to the min and max of the range
   * instead of extrapolated beyond the domain's bounds. */
  clamp?: boolean;

  exponent?: number;
  base?: number;
}

/**
 * Quantize scales map a continuous domain to discrete range.
 */
export interface QuantizeScaleConfig {
  /** The extent of a dataset from which equal intervals are derived using the length
   * of the provided range to determine the interval count.  */
  domain?: ValueSet;
  /** The set of values for the scale's visual space. */
  range: CSSRange | string[];

  count?: number;
}

/**
 * Quantile scales map a continuous domain to discrete range.
 */
export interface QuantileScaleConfig {
  /** The complete set of data form which equal frequency quantiles are derived using the
   * length of the provided range to dermine the interval count and the data itself to
   * determine interval size. */
  domain: number[];
  /** The set of values for the scale's visual space. */
  range: CSSRange | string[];

  count?: number;
}

/**
 * Ordinal scales map a discrete domain to a discrete range.
 */
export interface OrdinalScaleConfig {
  /** The discrete set of ordinal (or nominal) input data. */
  domain?: string[];
  /** The set of values for the scale's visual space. */
  range: CSSRange | string[];
  /** The value to use when a computed value is not in the domain. */
  unknown?: string;
}

/**
 * Identity scales always have a domain that is equivalent to its range
 * (i.e., identify function).
 */
export interface IdentityScaleConfig {
  /** The set of values for the scale's visual space and also data space. */
  range: number | number[];
}

/**
 * Band scales map a discrete domain to a continuous range. It additionally
 * has padding properties that result in a derived `bandwidth` value that represents
 * the visual space a discrete datum occupies in accordance to the padding properties.
 */
export interface BandScaleConfig {
  /** The discrete set of ordinal (or nominal) input data. */
  domain?: string[];
  /** The bounds of the scale's visual space. */
  range?: ValueSet;
  /** When `true`, ensures that `step` and `bandwidth` are integers. */
  round?: boolean;
  /** A number between 0 and 1 that specifies how the outer padding in the scale's
   * range is distributed. 0.5 represents centering bands in their range. */
  align?: number;
  /** A convenience property for setting `paddingInner` and `paddingOuter` at once. */
  padding?: number;
  /** A number between 0 and 1 that specifies how much spacing there is between bands
   * in proportion to band widths (e.g., when `padding` is 0.5, gaps and bands are
   * equal widths. */
  paddingInner?: number;
  /** A number between 0 and 1 that specifies how much padding is placed on the outside
   * of bands (while still subtracting available space from the `range`). */
  paddingOuter?: number;
}

/**
 * Point scales map a discrete domain to a continuous range. It is a band scale where
 * the derived `bandwidth` is always zero.
 */
export interface PointScaleConfig {
  /** The discrete set of ordinal (or nominal) input data. */
  domain?: string[];
  /** The bounds of the scale's visual space. */
  range?: ValueSet;
  /** When `true`, ensures that `step` and `bandwidth` are integers. */
  round?: boolean;
  /** A number between 0 and 1 that specifies how the outer padding in the scale's
   * range is distributed. 0.5 represents centering bands in their range. */
  align?: number;
  /** A number between 0 and 1 that specifies how much padding is placed on the outside
   * of the points (while still subtracting available space from the `range`). */
  padding?: number;
}

const boundsFromArg = (arg?: ValueSet): Bounds<number> => {
  if (arg instanceof Bounds) return arg;
  return arg ? Bounds.parse(arg) : new Bounds();
};

abstract class ScaleContinuous implements Scale {
  /** The bounds of the scale's data space. */
  @tracked domain: Bounds<number>;
  /** The bounds of the scale's visual space. */
  @tracked range: Bounds<number>;
  /** When `true`, values outside the domain are clamped to the min and max of the range
   * instead of extrapolated beyond the domain's bounds. */
  @tracked clamp = false;
  /** When `true`, domain bounds are rounded to nice numbers. */
  @tracked nice: boolean | number = false;

  constructor({ domain, range, clamp, nice }: ContinuousScaleConfig = {}) {
    this.domain = boundsFromArg(domain);
    this.range = boundsFromArg(range);
    this.clamp = clamp ?? false;
    this.nice = nice ?? false;
  }

  /**
   * The arguments for constructing a d3Scale instance, derived from the ScaleConfig.
   */
  get scaleArgs(): [number[], number[]] {
    return [this.domain.bounds, this.range.bounds];
  }

  /**
   * The d3Scale instance without generic modifications like clamp and nice applied yet.
   */
  abstract get _d3Scale(): scales.ScaleContinuousNumeric<number, number>;

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  abstract derive(options: ContinuousScaleConfig): ScaleContinuous;

  /**
   * The final d3Scale used for computation.
   */
  @cached get d3Scale(): scales.ScaleContinuousNumeric<number, number> {
    const scale = this._d3Scale;
    if (this.clamp) scale.clamp(true);
    if (this.nice && typeof this.nice === 'number') {
      scale.nice(this.nice);
    } else if (this.nice) {
      scale.nice();
    }

    return scale;
  }

  protected get commonCopyArgs(): ContinuousScaleConfig {
    return {
      domain: this.domain.copy(),
      range: this.range.copy(),
      clamp: this.clamp,
      nice: this.nice,
    };
  }

  /**
   * Computes a range value from a domain value.
   */
  compute = (value: number): number => {
    return this.d3Scale(value);
  };

  /**
   * Whether or not the Bounds for the domain and range are valid (i.e., have a valid
   * min and max value).
   */
  get isValid(): boolean {
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
export class ScaleLinear extends ScaleContinuous {
  get _d3Scale() {
    return scales.scaleLinear(...this.scaleArgs);
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: ContinuousScaleConfig): ScaleLinear => {
    return new ScaleLinear(Object.assign(this.commonCopyArgs, options));
  };
}

/**
 * A scale that maps a domain of values to a range of values on a power curve.
 */
export class ScalePow extends ScaleContinuous {
  /** The exponent of the power scale (e.g., 10 results in 10, 100, 1000 while 2 results in 2, 4, 8, 16). */
  @tracked exponent = 1;

  constructor(config: PowScaleConfig) {
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
  derive = (options: ContinuousScaleConfig): ScalePow => {
    return new ScalePow(Object.assign(this.commonCopyArgs, { exponent: this.exponent }, options));
  };
}

/**
 * A scale that maps a domain of values to a range of values on a logarithmic curve.
 */
export class ScaleLog extends ScaleContinuous {
  /** The base of the log scale (e.g., e results in a natural log while 10 results in the common log). */
  @tracked base = 10;

  constructor(config: LogScaleConfig) {
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
  derive = (options: ContinuousScaleConfig): ScaleLog => {
    return new ScaleLog(Object.assign(this.commonCopyArgs, { base: this.base }, options));
  };
}

/**
 * A scale that maps a domain of values to a range of values on a square root curve.
 */
export class ScaleSqrt extends ScaleContinuous {
  get _d3Scale() {
    return scales.scaleSqrt(...this.scaleArgs);
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: ContinuousScaleConfig): ScaleSqrt => {
    return new ScaleSqrt(Object.assign(this.commonCopyArgs, options));
  };
}

/**
 * A scale that maps a domain of values to a range of values on a symmetric logarithmic curve.
 */
export class ScaleSymlog extends ScaleContinuous {
  get _d3Scale() {
    return scales.scaleSymlog(...this.scaleArgs);
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: ContinuousScaleConfig): ScaleSymlog => {
    return new ScaleSymlog(Object.assign(this.commonCopyArgs, options));
  };
}

/**
 * A scale that maps a domain of values to a range of values on a linear curve where the range
 * is internally squared (to encode on area instead of radius).
 */
export class ScaleRadial extends ScaleContinuous {
  get _d3Scale() {
    return scales.scaleRadial(...this.scaleArgs);
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: ContinuousScaleConfig): ScaleRadial => {
    return new ScaleRadial(Object.assign(this.commonCopyArgs, options));
  };
}

abstract class AbstractScaleTime implements Scale {
  /** The bounds of the scale's data space. */
  @tracked domain: Bounds<Date>;
  /** The bounds of the scale's visual space. */
  @tracked range: Bounds<number>;
  /** When `true`, values outside the domain are clamped to the min and max of the range
   * instead of extrapolated beyond the domain's bounds. */
  @tracked clamp = false;
  /** When `true`, domain bounds are rounded to nice numbers. */
  @tracked nice: boolean | number = false;

  constructor({ domain, range, clamp, nice }: DateScaleConfig = {}) {
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
  get scaleArgs(): [Date[], number[]] {
    return [this.domain.bounds, this.range.bounds];
  }

  /**
   * The d3Scale instance without generic modifications like clamp and nice applied yet.
   */
  abstract get _d3Scale(): scales.ScaleTime<number, number>;

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  abstract derive(options: DateScaleConfig): AbstractScaleTime;

  protected get commonCopyArgs(): DateScaleConfig {
    return {
      domain: this.domain.copy(),
      range: this.range.copy(),
      clamp: this.clamp,
      nice: this.nice,
    };
  }

  /**
   * The final d3Scale used for computation.
   */
  @cached get d3Scale(): scales.ScaleTime<number, number> {
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
  compute = (value: Date): number => {
    return this.d3Scale(value);
  };

  /**
   * Whether or not the Bounds for the domain and range are valid (i.e., have a valid
   * min and max value).
   */
  get isValid(): boolean {
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
export class ScaleTime extends AbstractScaleTime {
  get _d3Scale() {
    return scales.scaleTime(...this.scaleArgs);
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: DateScaleConfig): ScaleTime => {
    return new ScaleTime(Object.assign(this.commonCopyArgs, options));
  };
}

/**
 * A `ScaleTime`, except the timezone is UTC instead of local.
 */
export class ScaleUtc extends AbstractScaleTime {
  get _d3Scale() {
    return scales.scaleUtc(...this.scaleArgs);
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: DateScaleConfig): ScaleTime => {
    return new ScaleTime(Object.assign(this.commonCopyArgs, options));
  };
}

/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * and then passes that number to a range interpolator.
 */
export class ScaleDiverging<T> implements Scale {
  /** The bounds of the scale's data space. Diverging scales have a three-number domain
   * representing [max-a, mid, max-b] */
  @tracked domain: [number, number, number];
  /** An interpolator that maps a value from -1-1 to a value in visual space.. */
  @tracked range: (t: number) => T;
  /** When `true`, values outside the domain are clamped to the min and max of the range
   * instead of extrapolated beyond the domain's bounds. */
  @tracked clamp = false;

  /** Diverging scales do not support `Bounds` and are therefore always valid. */
  isValid = true;

  /**
   * The underlying d3Scale function before setting parameters.
   */
  protected scaleFn: (interpolator?: (t: number) => T) => scales.ScaleDiverging<any, any> =
    scales.scaleDiverging;

  constructor({ domain, range, clamp }: DivergingScaleConfig) {
    this.domain = domain;
    this.range = range;
    this.clamp = clamp ?? false;
  }

  /**
   * The final d3Scale used for computation.
   */
  @cached get d3Scale() {
    const scale = this.scaleFn(this.range).domain(this.domain);
    if (this.clamp) scale.clamp(true);
    return scale;
  }

  get copyArgs(): DivergingScaleConfig {
    const [d1, d2, d3] = this.domain;
    return {
      domain: [d1, d2, d3],
      range: this.range,
      clamp: this.clamp,
    };
  }

  /**
   * Computes a range value from a domain value.
   */
  compute = (value: number): T => {
    return this.d3Scale(value);
  };

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: DivergingScaleConfig): ScaleDiverging<T> => {
    return new ScaleDiverging<T>(Object.assign(this.copyArgs, options));
  };
}

/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a logarithmic curve and then passes that number to a range interpolator.
 */
export class ScaleDivergingLog<T> extends ScaleDiverging<T> {
  @tracked base: number;

  protected scaleFn = scales.scaleDivergingLog;

  constructor(config: DivergingScaleConfig) {
    super(config);
    this.base = config.base ?? 1;
  }

  @cached get d3Scale() {
    // @ts-ignore
    const scale = this.scaleFn(this.range).domain(this.domain).base(this.base);
    if (this.clamp) scale.clamp(true);
    return scale;
  }

  get copyArgs(): DivergingScaleConfig {
    const { base } = this;
    return Object.assign(super.copyArgs, { base });
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: DivergingScaleConfig): ScaleDivergingLog<T> => {
    return new ScaleDivergingLog<T>(Object.assign(this.copyArgs, options));
  };
}

/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a power curve and then passes that number to a range interpolator.
 */
export class ScaleDivergingPow<T> extends ScaleDiverging<T> {
  @tracked exponent: number;

  protected scaleFn = scales.scaleDivergingPow;

  constructor(config: DivergingScaleConfig) {
    super(config);
    this.exponent = config.exponent ?? 1;
  }

  @cached get d3Scale() {
    // @ts-ignore
    const scale = this.scaleFn(this.range).domain(this.domain).exponent(this.exponent);
    if (this.clamp) scale.clamp(true);
    return scale;
  }

  get copyArgs(): DivergingScaleConfig {
    const { exponent } = this;
    return Object.assign(super.copyArgs, { exponent });
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: DivergingScaleConfig): ScaleDivergingPow<T> => {
    return new ScaleDivergingPow<T>(Object.assign(this.copyArgs, options));
  };
}

/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a square root curve and then passes that number to a range interpolator.
 */
export class ScaleDivergingSqrt<T> extends ScaleDiverging<T> {
  protected scaleFn = scales.scaleDivergingSqrt;

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: DivergingScaleConfig): ScaleDivergingSqrt<T> => {
    return new ScaleDivergingSqrt<T>(Object.assign(this.copyArgs, options));
  };
}

/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a symmetric log curve and then passes that number to a range interpolator.
 */
export class ScaleDivergingSymlog<T> extends ScaleDiverging<T> {
  protected scaleFn = scales.scaleDivergingSymlog;

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: DivergingScaleConfig): ScaleDivergingSymlog<T> => {
    return new ScaleDivergingSymlog<T>(Object.assign(this.copyArgs, options));
  };
}

/**
 * A scale that maps a domain of values to a discrete set of range values, with intervals portioned
 * by the range.
 */
export class ScaleQuantize implements Scale {
  /** The extent of a dataset from which equal intervals are derived using the length
   * of the provided range to determine the interval count.  */
  @tracked domain: Bounds<number>;
  /** The set of values for the scale's visual space. */
  @tracked range: CSSRange | string[];
  /** When range is a CSSRange, this becomes the interval count. */
  @tracked count?: number;

  constructor({ domain, range, count }: QuantizeScaleConfig) {
    this.domain = boundsFromArg(domain);
    this.range = range;
    this.count = count;
  }

  /** Derived number and string arrays to be used to construct a scale (when the domain is a
   * {@link bounds.default | Bounds} or the range is a {@link css-range.default | CSSRange}). */
  get scaleArgs(): [number[], string[]] {
    const domain: number[] = this.domain instanceof Bounds ? this.domain.bounds : this.domain;
    const range: string[] =
      this.range instanceof CSSRange ? this.range.spread(this.count ?? domain.length) : this.range;
    return [domain, range];
  }

  /**
   * The d3Scale used for computation.
   */
  @cached get d3Scale() {
    const [domain, range] = this.scaleArgs;
    return scales.scaleQuantize(range).domain(domain);
  }

  /**
   * Computes a range value from a domain value.
   */
  compute = (value: number): string => {
    return this.d3Scale(value);
  };

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: QuantizeScaleConfig): ScaleQuantize => {
    return new ScaleQuantize(
      Object.assign(
        {
          domain: this.domain.copy(),
          range: this.range instanceof CSSRange ? this.range.copy() : this.range.slice(),
          count: this.count,
        },
        options
      )
    );
  };

  /**
   * Whether or not the Bounds for the domain and range are valid (i.e., have a valid
   * min and max value).
   */
  get isValid(): boolean {
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
export class ScaleQuantile implements Scale {
  /** The complete set of data form which equal frequency quantiles are derived using the
   * length of the provided range to dermine the interval count and the data itself to
   * determine interval size. */
  @tracked domain: number[];
  /** The set of values for the scale's visual space. */
  @tracked range: CSSRange | string[];
  /** When range is a CSSRange, this becomes the interval count. */
  @tracked count?: number;

  /** Quantile scales do not support `Bounds` and are therefore always valid. */
  isValid = true;

  constructor({ domain, range, count }: QuantileScaleConfig) {
    this.domain = domain;
    this.range = range;
    this.count = count;
  }

  /**
   * The d3Scale used for computation.
   */
  @cached get d3Scale() {
    const range: string[] =
      this.range instanceof CSSRange
        ? this.range.spread(this.count ?? this.domain.length)
        : this.range;
    return scales.scaleQuantile(range).domain(this.domain);
  }

  /**
   * Computes a range value from a domain value.
   */
  compute = (value: number): string => {
    return this.d3Scale(value);
  };

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: QuantileScaleConfig): ScaleQuantile => {
    return new ScaleQuantile(
      Object.assign(
        {
          domain: this.domain.slice(),
          range: this.range instanceof CSSRange ? this.range.copy() : this.range.slice(),
          count: this.count,
        },
        options
      )
    );
  };
}

/**
 * A scale that maps a set of values to a discrete set of range values, with intervals portioned
 * by the elements set in the domain.
 */
export class ScaleThreshold implements Scale {
  /** The values that define the bucket points in a dataset. */
  @tracked domain: number[];
  /** The set of values for the scale's visual space. */
  @tracked range: CSSRange | string[];

  /** Threshold scales do not support `Bounds` and are therefore always valid. */
  isValid = true;

  constructor({ domain, range }: QuantileScaleConfig) {
    this.domain = domain;
    this.range = range;
  }

  /**
   * The d3Scale used for computation.
   */
  @cached get d3Scale() {
    const range: string[] =
      this.range instanceof CSSRange ? this.range.spread(this.domain.length + 1) : this.range;
    return scales.scaleThreshold(range).domain(this.domain);
  }

  /**
   * Computes a range value from a domain value.
   */
  compute = (value: number): string => {
    return this.d3Scale(value);
  };

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: QuantileScaleConfig): ScaleThreshold => {
    return new ScaleThreshold(
      Object.assign(
        {
          domain: this.domain.slice(),
          range: this.range instanceof CSSRange ? this.range.copy() : this.range.slice(),
        },
        options
      )
    );
  };
}

/**
 * A scale that maps a discrete set of domain values to a discrete set of range values.
 */
export class ScaleOrdinal implements Scale {
  /** The set of values for the scale's data space. */
  @tracked domain: string[];
  /** The set of values for the scale's visual space. */
  @tracked range: CSSRange | string[];
  /** The value returned for input vaues that are not in the domain. */
  @tracked unknown: string | undefined;

  /** Threshold scales do not support `Bounds` and are therefore always valid. */
  isValid = true;

  constructor({ domain, range, unknown }: OrdinalScaleConfig) {
    this.domain = domain || [];
    this.range = range;
    this.unknown = unknown;
  }

  /**
   * The d3Scale used for computation.
   */
  @cached get d3Scale() {
    // TODO: Return to instanceof checks when https://github.com/ef4/ember-auto-import/pull/512 is released.
    const range: string[] =
      this.range.constructor.name === 'CSSRange' || this.range instanceof CSSRange
        ? (this.range as CSSRange).spread(this.domain.length)
        : (this.range as string[]);
    const scale = scales.scaleOrdinal(range).domain(this.domain);

    if (this.unknown != null) {
      scale.unknown(this.unknown);
    }

    return scale;
  }

  /**
   * Computes a range value from a domain value.
   */
  compute = (value: string): string => {
    return this.d3Scale(value);
  };

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: OrdinalScaleConfig): ScaleOrdinal => {
    return new ScaleOrdinal(
      Object.assign(
        {
          domain: this.domain.slice(),
          range: this.range instanceof CSSRange ? this.range.copy() : this.range.slice(),
          unknown: this.unknown,
        },
        options
      )
    );
  };
}

/**
 * A scale with equivalent domains and ranges (like an identity function).
 */
export class ScaleIdentity implements Scale {
  /** The set of values for both the scale's data space and visual space. */
  @tracked range: number[];

  /** Identity scales do not support `Bounds` and are therefore always valid. */
  isValid = true;

  constructor({ range }: IdentityScaleConfig) {
    this.range = range instanceof Array ? range : [range, range];
  }

  /**
   * The d3Scale used for computation.
   */
  @cached get d3Scale() {
    return scales.scaleIdentity(this.range);
  }

  /** The set of values for the scale's data space. Since the range and domain are always equivalent,
   * this is here for Scale interface compatability. */
  @cached get domain() {
    return this.range;
  }

  /**
   * Computes a range value from a domain value.
   */
  compute = (value: number): number => {
    return this.d3Scale(value);
  };

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: IdentityScaleConfig): ScaleIdentity => {
    return new ScaleIdentity(
      Object.assign(
        {
          range: this.range.slice(),
        },
        options
      )
    );
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
export class ScaleBand implements Scale {
  /** The discrete set of ordinal (or nominal) input data. */
  @tracked domain: string[];
  /** The bounds of the scale's visual space. */
  @tracked range: Bounds<number>;
  /** When `true`, ensures that `step` and `bandwidth` are integers. */
  @tracked round = false;
  /** A number between 0 and 1 that specifies how the outer padding in the scale's
   * range is distributed. 0.5 represents centering bands in their range. */
  @tracked align = 0.5;
  /** A number between 0 and 1 that specifies how much spacing there is between bands
   * in proportion to band widths (e.g., when `padding` is 0.5, gaps and bands are
   * equal widths. */
  @tracked paddingInner = 0;
  /** A number between 0 and 1 that specifies how much padding is placed on the outside
   * of bands (while still subtracting available space from the `range`). */
  @tracked paddingOuter = 0;

  constructor({
    domain,
    range,
    round,
    align,
    paddingInner,
    paddingOuter,
    padding,
  }: BandScaleConfig) {
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
  get isValid(): boolean {
    return this.range.isValid;
  }

  /**
   * The final d3Scale used for computation.
   */
  @cached get d3Scale() {
    const range: number[] = this.range instanceof Bounds ? this.range.bounds : this.range;
    return scales
      .scaleBand(range)
      .domain(this.domain)
      .round(this.round)
      .align(this.align)
      .paddingInner(this.paddingInner)
      .paddingOuter(this.paddingOuter);
  }

  /**
   * Computes a range value from a domain value.
   */
  compute = (value: string): number | undefined => {
    return this.d3Scale(value);
  };

  /**
   * The width for a single band within the scale (this represents the width
   * of a bar in a traditional bar chart).
   */
  get bandwidth(): number {
    return this.d3Scale.bandwidth();
  }

  /**
   * The space bewteen two elements in the scale (this represents the width
   * of a bar + the padding between bars in a traditional bar chart).
   */
  get step(): number {
    return this.d3Scale.step();
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: BandScaleConfig): ScaleBand => {
    const config: BandScaleConfig = {
      domain: this.domain.slice(),
      range: this.range.copy(),
      align: this.align,
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
export class ScalePoint implements Scale {
  /** The discrete set of ordinal (or nominal) input data. */
  @tracked domain: string[];
  /** The bounds of the scale's visual space. */
  @tracked range: Bounds<number>;
  /** When `true`, ensures that `step` and `bandwidth` are integers. */
  @tracked round = false;
  /** A number between 0 and 1 that specifies how the outer padding in the scale's
   * range is distributed. 0.5 represents centering bands in their range. */
  @tracked align = 0.5;
  /** A number between 0 and 1 that specifies how much padding is placed on the outside
   * of the points (while still subtracting available space from the `range`). */
  @tracked padding = 0;

  constructor({ domain, range, round, align, padding }: PointScaleConfig) {
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
  get isValid(): boolean {
    return this.range.isValid;
  }

  /**
   * The final d3Scale used for computation.
   */
  @cached get d3Scale() {
    const range: number[] = this.range instanceof Bounds ? this.range.bounds : this.range;
    return scales
      .scalePoint(range)
      .domain(this.domain)
      .round(this.round)
      .align(this.align)
      .padding(this.padding);
  }

  compute = (value: string): number | undefined => {
    return this.d3Scale(value);
  };

  /**
   * Always returns `0`. It's here for d3 compatability (where point scales are a special form
   * of band scale).
   */
  get bandwidth(): number {
    // Always returns zero. It's here's for d3 compatability.
    return this.d3Scale.bandwidth();
  }

  /**
   * The space bewteen two elements in the scale (this represents the width
   * of a bar + the padding between bars in a traditional bar chart).
   */
  get step(): number {
    return this.d3Scale.step();
  }

  /**
   * Creates a new scale of the same type and same properties. The options arg overrides
   * any set properties (like `Object.assign`).
   */
  derive = (options: BandScaleConfig): ScaleBand => {
    return new ScaleBand(
      Object.assign(
        {
          domain: this.domain.slice(),
          range: this.range.copy(),
          align: this.align,
          padding: this.padding,
        },
        options
      )
    );
  };
}
