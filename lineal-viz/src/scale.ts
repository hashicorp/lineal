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
}

/**
 * A value set is either an array of numbers (a step-wise representation of a range)
 * or a string (parsed as Bounds range expression).
 */
export type ValueSet = number[] | string;

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
  nice?: boolean;
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
  domain?: Date[];
  /** The bounds of the scale's visual space. */
  range?: ValueSet;
  /** When `true`, values outside the domain are clamped to the min and max of the range
   * instead of extrapolated beyond the domain's bounds. */
  clamp?: boolean;
  /** When `true`, domain bounds are rounded to nice numbers. */
  nice?: boolean;
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

abstract class ScaleContinuous implements Scale {
  /** The bounds of the scale's data space. */
  @tracked domain: Bounds<number> | number[];
  /** The bounds of the scale's visual space. */
  @tracked range: Bounds<number> | number[];
  /** When `true`, values outside the domain are clamped to the min and max of the range
   * instead of extrapolated beyond the domain's bounds. */
  @tracked clamp: boolean = false;
  /** When `true`, domain bounds are rounded to nice numbers. */
  @tracked nice: boolean | number = false;

  constructor({ domain, range, clamp, nice }: ContinuousScaleConfig = {}) {
    this.domain = domain ? Bounds.parse(domain) : new Bounds();
    this.range = range ? Bounds.parse(range) : new Bounds();
    this.clamp = clamp ?? false;
    this.nice = nice ?? false;
  }

  /**
   * The arguments for constructing a d3Scale instance, derived from the ScaleConfig.
   */
  get scaleArgs(): [number[], number[]] {
    return [
      this.domain instanceof Bounds ? this.domain.bounds : this.domain,
      this.range instanceof Bounds ? this.range.bounds : this.range,
    ];
  }

  /**
   * The d3Scale instance without generic modifications like clamp and nice applied yet.
   */
  abstract get _d3Scale(): scales.ScaleContinuousNumeric<number, number>;

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
    if (this.domain instanceof Bounds && !this.domain.isValid) return false;
    if (this.range instanceof Bounds && !this.range.isValid) return false;
    return true;
  }
}

/**
 * A scale that maps a domain of values to a range of values on a linear curve.
 */
export class ScaleLinear extends ScaleContinuous {
  get _d3Scale() {
    return scales.scaleLinear(...this.scaleArgs);
  }
}

/**
 * A scale that maps a domain of values to a range of values on a power curve.
 */
export class ScalePow extends ScaleContinuous {
  /** The exponent of the power scale (e.g., 10 results in 10, 100, 1000 while 2 results in 2, 4, 8, 16). */
  @tracked exponent: number = 1;

  constructor(config: PowScaleConfig) {
    super(config);
    this.exponent = config.exponent ?? 1;
  }

  get _d3Scale() {
    return scales.scalePow(...this.scaleArgs).exponent(this.exponent);
  }
}

/**
 * A scale that maps a domain of values to a range of values on a logarithmic curve.
 */
export class ScaleLog extends ScaleContinuous {
  /** The base of the log scale (e.g., e results in a natural log while 10 results in the common log). */
  @tracked base: number = 10;

  constructor(config: LogScaleConfig) {
    super(config);
    this.base = config.base ?? 10;
  }

  get _d3Scale() {
    return scales.scaleLog(...this.scaleArgs).base(this.base);
  }
}

/**
 * A scale that maps a domain of values to a range of values on a square root curve.
 */
export class ScaleSqrt extends ScaleContinuous {
  get _d3Scale() {
    return scales.scaleSqrt(...this.scaleArgs);
  }
}

/**
 * A scale that maps a domain of values to a range of values on a symmetric logarithmic curve.
 */
export class ScaleSymlog extends ScaleContinuous {
  get _d3Scale() {
    return scales.scaleSymlog(...this.scaleArgs);
  }
}

/**
 * A scale that maps a domain of values to a range of values on a linear curve where the range
 * is internally squared (to encode on area instead of radius).
 */
export class ScaleRadial extends ScaleContinuous {
  get _d3Scale() {
    return scales.scaleRadial(...this.scaleArgs);
  }
}

abstract class AbstractScaleTime implements Scale {
  /** The bounds of the scale's data space. */
  @tracked domain: Bounds<Date> | Date[];
  /** The bounds of the scale's visual space. */
  @tracked range: Bounds<number> | number[];
  /** When `true`, values outside the domain are clamped to the min and max of the range
   * instead of extrapolated beyond the domain's bounds. */
  @tracked clamp: boolean = false;
  /** When `true`, domain bounds are rounded to nice numbers. */
  @tracked nice: boolean | number = false;

  constructor({ domain, range, clamp, nice }: DateScaleConfig = {}) {
    this.domain = domain ?? new Bounds();
    this.range = range ? Bounds.parse(range) : new Bounds();
    this.clamp = clamp ?? false;
    this.nice = nice ?? false;
  }

  /**
   * The arguments for constructing a d3Scale instance, derived from the `DateScaleConfig`.
   */
  get scaleArgs(): [Date[], number[]] {
    return [
      this.domain instanceof Bounds ? this.domain.bounds : this.domain,
      this.range instanceof Bounds ? this.range.bounds : this.range,
    ];
  }

  /**
   * The d3Scale instance without generic modifications like clamp and nice applied yet.
   */
  abstract get _d3Scale(): scales.ScaleTime<number, number>;

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
    if (this.domain instanceof Bounds && !this.domain.isValid) return false;
    if (this.range instanceof Bounds && !this.range.isValid) return false;
    return true;
  }
}

/**
 * A scale that maps a domain of date values to a range of values on linear curve.
 */
export class ScaleTime extends AbstractScaleTime {
  get _d3Scale() {
    return scales.scaleTime(...this.scaleArgs);
  }
}

/**
 * A `ScaleTime`, except the timezone is UTC instead of local.
 */
export class ScaleUtc extends AbstractScaleTime {
  get _d3Scale() {
    return scales.scaleUtc(...this.scaleArgs);
  }
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
  @tracked clamp: boolean = false;

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

  /**
   * Computes a range value from a domain value.
   */
  compute = (value: number): T => {
    return this.d3Scale(value);
  };
}

/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a logarithmic curve and then passes that number to a range interpolator.
 */
export class ScaleDivergingLog<T> extends ScaleDiverging<T> {
  protected scaleFn = scales.scaleDivergingLog;
}

/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a power curve and then passes that number to a range interpolator.
 */
export class ScaleDivergingPow<T> extends ScaleDiverging<T> {
  protected scaleFn = scales.scaleDivergingPow;
}

/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a square root curve and then passes that number to a range interpolator.
 */
export class ScaleDivergingSqrt<T> extends ScaleDiverging<T> {
  protected scaleFn = scales.scaleDivergingSqrt;
}

/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a symmetric log curve and then passes that number to a range interpolator.
 */
export class ScaleDivergingSymlog<T> extends ScaleDiverging<T> {
  protected scaleFn = scales.scaleDivergingSymlog;
}

/**
 * A scale that maps a domain of values to a discrete set of range values.
 */
export class ScaleQuantize implements Scale {
  @tracked domain: Bounds<number> | number[];
  @tracked range: CSSRange | string[];

  constructor({ domain, range }: QuantizeScaleConfig) {
    this.domain = domain ? Bounds.parse(domain) : new Bounds();
    this.range = range;
  }

  get scaleArgs(): [number[], string[]] {
    const domain: number[] = this.domain instanceof Bounds ? this.domain.bounds : this.domain;
    const range: string[] =
      this.range instanceof CSSRange ? this.range.spread(domain.length) : this.range;
    return [domain, range];
  }

  @cached get d3Scale() {
    const [domain, range] = this.scaleArgs;
    return scales.scaleQuantize(range).domain(domain);
  }

  compute = (value: number): string => {
    return this.d3Scale(value);
  };

  get isValid(): boolean {
    if (this.domain instanceof Bounds && !this.domain.isValid) return false;
    return true;
  }
}

export class ScaleQuantile implements Scale {
  @tracked domain: number[];
  @tracked range: CSSRange | string[];

  isValid = true;

  constructor({ domain, range }: QuantileScaleConfig) {
    this.domain = domain;
    this.range = range;
  }

  @cached get d3Scale() {
    const range: string[] =
      this.range instanceof CSSRange ? this.range.spread(this.domain.length) : this.range;
    return scales.scaleQuantile(range).domain(this.domain);
  }

  compute = (value: number): string => {
    return this.d3Scale(value);
  };
}

export class ScaleThreshold implements Scale {
  @tracked domain: number[];
  @tracked range: CSSRange | string[];

  isValid = true;

  constructor({ domain, range }: QuantileScaleConfig) {
    this.domain = domain;
    this.range = range;
  }

  @cached get d3Scale() {
    const range: string[] =
      this.range instanceof CSSRange ? this.range.spread(this.domain.length + 1) : this.range;
    return scales.scaleQuantile(range).domain(this.domain);
  }

  compute = (value: number): string => {
    return this.d3Scale(value);
  };
}

export class ScaleOrdinal implements Scale {
  @tracked domain: string[];
  @tracked range: CSSRange | string[];
  @tracked unknown: string | undefined;

  isValid = true;

  constructor({ domain, range, unknown }: OrdinalScaleConfig) {
    this.domain = domain || [];
    this.range = range;
    this.unknown = unknown;
  }

  @cached get d3Scale() {
    const range: string[] =
      this.range instanceof CSSRange ? this.range.spread(this.domain.length) : this.range;
    const scale = scales.scaleOrdinal(range).domain(this.domain);

    if (this.unknown != null) {
      scale.unknown(this.unknown);
    }

    return scale;
  }

  compute = (value: string): string => {
    return this.d3Scale(value);
  };
}

export class ScaleIdentity implements Scale {
  @tracked range: number[];

  isValid = true;

  constructor({ range }: IdentityScaleConfig) {
    this.range = range instanceof Array ? range : [range, range];
  }

  @cached get d3Scale() {
    return scales.scaleIdentity(this.range);
  }

  @cached get domain() {
    return this.range;
  }

  compute = (value: number): number => {
    return this.d3Scale(value);
  };
}

export class ScaleBand implements Scale {
  @tracked domain: string[];
  @tracked range: Bounds<number> | number[];
  @tracked round: boolean = false;
  @tracked align: number = 0.5;
  @tracked paddingInner: number = 0;
  @tracked paddingOuter: number = 0;

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
    this.range = range ? Bounds.parse(range) : new Bounds();
    this.round = round ?? false;
    this.align = align ?? 0.5;
    this.paddingInner = paddingInner ?? padding ?? 0;
    this.paddingOuter = paddingOuter ?? padding ?? 0;
  }

  get isValid(): boolean {
    if (this.range instanceof Bounds && !this.range.isValid) return false;
    return true;
  }

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

  compute = (value: string): number | undefined => {
    return this.d3Scale(value);
  };

  get bandwidth(): number {
    return this.d3Scale.bandwidth();
  }

  get step(): number {
    return this.d3Scale.step();
  }
}

export class ScalePoint implements Scale {
  @tracked domain: string[];
  @tracked range: Bounds<number> | number[];
  @tracked round: boolean = false;
  @tracked align: number = 0.5;
  @tracked padding: number = 0;

  constructor({ domain, range, round, align, padding }: PointScaleConfig) {
    this.domain = domain || [];
    this.range = range ? Bounds.parse(range) : new Bounds();
    this.round = round ?? false;
    this.align = align ?? 0.5;
    this.padding = padding ?? 0;
  }

  get isValid(): boolean {
    if (this.range instanceof Bounds && !this.range.isValid) return false;
    return true;
  }

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

  get bandwidth(): number {
    // Always returns zero. It's here's for d3 compatability.
    return this.d3Scale.bandwidth();
  }

  get step(): number {
    return this.d3Scale.step();
  }
}
