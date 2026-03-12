/**
 * Copyright IBM Corp. 2020, 2026
 */
import * as scales from 'd3-scale';
import Bounds from './bounds.ts';
import CSSRange from './css-range.ts';
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
    /** The default tick values for the scale. These are domain values, not range values. */
    ticks?: any[];
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
declare abstract class ScaleContinuous implements Scale {
    /** The bounds of the scale's data space. */
    domain: Bounds<number>;
    /** The bounds of the scale's visual space. */
    range: Bounds<number>;
    /** When `true`, values outside the domain are clamped to the min and max of the range
     * instead of extrapolated beyond the domain's bounds. */
    clamp: boolean;
    /** When `true`, domain bounds are rounded to nice numbers. */
    nice: boolean | number;
    constructor({ domain, range, clamp, nice }?: ContinuousScaleConfig);
    /**
     * The arguments for constructing a d3Scale instance, derived from the ScaleConfig.
     */
    get scaleArgs(): [number[], number[]];
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
    get d3Scale(): scales.ScaleContinuousNumeric<number, number>;
    protected get commonCopyArgs(): ContinuousScaleConfig;
    /**
     * Computes a range value from a domain value.
     */
    compute: (value: number) => number;
    /**
     * Whether or not the Bounds for the domain and range are valid (i.e., have a valid
     * min and max value).
     */
    get isValid(): boolean;
    /**
     * The default tick values for the scale. These are domain values, not range values.
     */
    get ticks(): number[];
}
/**
 * A scale that maps a domain of values to a range of values on a linear curve.
 */
export declare class ScaleLinear extends ScaleContinuous {
    get _d3Scale(): scales.ScaleLinear<number, number, never>;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: ContinuousScaleConfig) => ScaleLinear;
}
/**
 * A scale that maps a domain of values to a range of values on a power curve.
 */
export declare class ScalePow extends ScaleContinuous {
    /** The exponent of the power scale (e.g., 10 results in 10, 100, 1000 while 2 results in 2, 4, 8, 16). */
    exponent: number;
    constructor(config: PowScaleConfig);
    get _d3Scale(): scales.ScalePower<number, number, never>;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: ContinuousScaleConfig) => ScalePow;
}
/**
 * A scale that maps a domain of values to a range of values on a logarithmic curve.
 */
export declare class ScaleLog extends ScaleContinuous {
    /** The base of the log scale (e.g., e results in a natural log while 10 results in the common log). */
    base: number;
    constructor(config: LogScaleConfig);
    get _d3Scale(): scales.ScaleLogarithmic<number, number, never>;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: ContinuousScaleConfig) => ScaleLog;
}
/**
 * A scale that maps a domain of values to a range of values on a square root curve.
 */
export declare class ScaleSqrt extends ScaleContinuous {
    get _d3Scale(): scales.ScalePower<number, number, never>;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: ContinuousScaleConfig) => ScaleSqrt;
}
/**
 * A scale that maps a domain of values to a range of values on a symmetric logarithmic curve.
 */
export declare class ScaleSymlog extends ScaleContinuous {
    get _d3Scale(): scales.ScaleSymLog<number, number, never>;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: ContinuousScaleConfig) => ScaleSymlog;
}
/**
 * A scale that maps a domain of values to a range of values on a linear curve where the range
 * is internally squared (to encode on area instead of radius).
 */
export declare class ScaleRadial extends ScaleContinuous {
    get _d3Scale(): scales.ScaleRadial<number, number, never>;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: ContinuousScaleConfig) => ScaleRadial;
}
declare abstract class AbstractScaleTime implements Scale {
    /** The bounds of the scale's data space. */
    domain: Bounds<Date>;
    /** The bounds of the scale's visual space. */
    range: Bounds<number>;
    /** When `true`, values outside the domain are clamped to the min and max of the range
     * instead of extrapolated beyond the domain's bounds. */
    clamp: boolean;
    /** When `true`, domain bounds are rounded to nice numbers. */
    nice: boolean | number;
    constructor({ domain, range, clamp, nice }?: DateScaleConfig);
    /**
     * The arguments for constructing a d3Scale instance, derived from the `DateScaleConfig`.
     */
    get scaleArgs(): [Date[], number[]];
    /**
     * The d3Scale instance without generic modifications like clamp and nice applied yet.
     */
    abstract get _d3Scale(): scales.ScaleTime<number, number>;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    abstract derive(options: DateScaleConfig): AbstractScaleTime;
    protected get commonCopyArgs(): DateScaleConfig;
    /**
     * The final d3Scale used for computation.
     */
    get d3Scale(): scales.ScaleTime<number, number>;
    /**
     * Computes a range value from a domain value.
     */
    compute: (value: Date) => number;
    /**
     * Whether or not the Bounds for the domain and range are valid (i.e., have a valid
     * min and max value).
     */
    get isValid(): boolean;
    /**
     * The default tick values for the scale. These are domain values, not range values.
     */
    get ticks(): Date[];
}
/**
 * A scale that maps a domain of date values to a range of values on linear curve.
 */
export declare class ScaleTime extends AbstractScaleTime {
    get _d3Scale(): scales.ScaleTime<number, number, never>;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: DateScaleConfig) => ScaleTime;
}
/**
 * A `ScaleTime`, except the timezone is UTC instead of local.
 */
export declare class ScaleUtc extends AbstractScaleTime {
    get _d3Scale(): scales.ScaleTime<number, number, never>;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: DateScaleConfig) => ScaleTime;
}
/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * and then passes that number to a range interpolator.
 */
export declare class ScaleDiverging<T> implements Scale {
    /** The bounds of the scale's data space. Diverging scales have a three-number domain
     * representing [max-a, mid, max-b] */
    domain: [number, number, number];
    /** An interpolator that maps a value from -1-1 to a value in visual space.. */
    range: (t: number) => T;
    /** When `true`, values outside the domain are clamped to the min and max of the range
     * instead of extrapolated beyond the domain's bounds. */
    clamp: boolean;
    /** Diverging scales do not support `Bounds` and are therefore always valid. */
    isValid: boolean;
    /**
     * The underlying d3Scale function before setting parameters.
     */
    protected scaleFn: (interpolator?: (t: number) => T) => scales.ScaleDiverging<any, any>;
    constructor({ domain, range, clamp }: DivergingScaleConfig);
    /**
     * The final d3Scale used for computation.
     */
    get d3Scale(): scales.ScaleDiverging<any, any>;
    get copyArgs(): DivergingScaleConfig;
    /**
     * Computes a range value from a domain value.
     */
    compute: (value: number) => T;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: DivergingScaleConfig) => ScaleDiverging<T>;
}
/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a logarithmic curve and then passes that number to a range interpolator.
 */
export declare class ScaleDivergingLog<T> extends ScaleDiverging<T> {
    base: number;
    protected scaleFn: typeof scales.scaleDivergingLog;
    constructor(config: DivergingScaleConfig);
    get d3Scale(): any;
    get copyArgs(): DivergingScaleConfig;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: DivergingScaleConfig) => ScaleDivergingLog<T>;
}
/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a power curve and then passes that number to a range interpolator.
 */
export declare class ScaleDivergingPow<T> extends ScaleDiverging<T> {
    exponent: number;
    protected scaleFn: typeof scales.scaleDivergingPow;
    constructor(config: DivergingScaleConfig);
    get d3Scale(): any;
    get copyArgs(): DivergingScaleConfig;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: DivergingScaleConfig) => ScaleDivergingPow<T>;
}
/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a square root curve and then passes that number to a range interpolator.
 */
export declare class ScaleDivergingSqrt<T> extends ScaleDiverging<T> {
    protected scaleFn: typeof scales.scaleDivergingSqrt;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: DivergingScaleConfig) => ScaleDivergingSqrt<T>;
}
/**
 * A scale that maps a domain of two diverging values and a midpoint to a value between -1 and 1
 * along a symmetric log curve and then passes that number to a range interpolator.
 */
export declare class ScaleDivergingSymlog<T> extends ScaleDiverging<T> {
    protected scaleFn: typeof scales.scaleDivergingSymlog;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: DivergingScaleConfig) => ScaleDivergingSymlog<T>;
}
/**
 * A scale that maps a domain of values to a discrete set of range values, with intervals portioned
 * by the range.
 */
export declare class ScaleQuantize implements Scale {
    /** The extent of a dataset from which equal intervals are derived using the length
     * of the provided range to determine the interval count.  */
    domain: Bounds<number>;
    /** The set of values for the scale's visual space. */
    range: CSSRange | string[];
    /** When range is a CSSRange, this becomes the interval count. */
    count?: number;
    constructor({ domain, range, count }: QuantizeScaleConfig);
    /** Derived number and string arrays to be used to construct a scale (when the domain is a
     * {@link bounds.default | Bounds} or the range is a {@link css-range.default | CSSRange}). */
    get scaleArgs(): [number[], string[]];
    /**
     * The d3Scale used for computation.
     */
    get d3Scale(): scales.ScaleQuantize<string, never>;
    /**
     * Computes a range value from a domain value.
     */
    compute: (value: number) => string;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: QuantizeScaleConfig) => ScaleQuantize;
    /**
     * Whether or not the Bounds for the domain and range are valid (i.e., have a valid
     * min and max value).
     */
    get isValid(): boolean;
    /**
     * The default tick values for the scale. These are domain values, not range values.
     */
    get ticks(): number[];
}
/**
 * A scale that maps a set of values to a discrete set of range values, with intervals portioned
 * by the frequency of values in the dataset.
 */
export declare class ScaleQuantile implements Scale {
    /** The complete set of data form which equal frequency quantiles are derived using the
     * length of the provided range to dermine the interval count and the data itself to
     * determine interval size. */
    domain: number[];
    /** The set of values for the scale's visual space. */
    range: CSSRange | string[];
    /** When range is a CSSRange, this becomes the interval count. */
    count?: number;
    /** Quantile scales do not support `Bounds` and are therefore always valid. */
    isValid: boolean;
    constructor({ domain, range, count }: QuantileScaleConfig);
    /**
     * The d3Scale used for computation.
     */
    get d3Scale(): scales.ScaleQuantile<string, never>;
    /**
     * Computes a range value from a domain value.
     */
    compute: (value: number) => string;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: QuantileScaleConfig) => ScaleQuantile;
}
/**
 * A scale that maps a set of values to a discrete set of range values, with intervals portioned
 * by the elements set in the domain.
 */
export declare class ScaleThreshold implements Scale {
    /** The values that define the bucket points in a dataset. */
    domain: number[];
    /** The set of values for the scale's visual space. */
    range: CSSRange | string[];
    /** Threshold scales do not support `Bounds` and are therefore always valid. */
    isValid: boolean;
    constructor({ domain, range }: QuantileScaleConfig);
    /**
     * The d3Scale used for computation.
     */
    get d3Scale(): scales.ScaleThreshold<number, string, never>;
    /**
     * Computes a range value from a domain value.
     */
    compute: (value: number) => string;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: QuantileScaleConfig) => ScaleThreshold;
}
/**
 * A scale that maps a discrete set of domain values to a discrete set of range values.
 */
export declare class ScaleOrdinal implements Scale {
    /** The set of values for the scale's data space. */
    domain: string[];
    /** The set of values for the scale's visual space. */
    range: CSSRange | string[];
    /** The value returned for input vaues that are not in the domain. */
    unknown: string | undefined;
    /** Threshold scales do not support `Bounds` and are therefore always valid. */
    isValid: boolean;
    constructor({ domain, range, unknown }: OrdinalScaleConfig);
    /**
     * The d3Scale used for computation.
     */
    get d3Scale(): scales.ScaleOrdinal<string, string, never>;
    /**
     * Computes a range value from a domain value.
     */
    compute: (value: string) => string;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: OrdinalScaleConfig) => ScaleOrdinal;
}
/**
 * A scale with equivalent domains and ranges (like an identity function).
 */
export declare class ScaleIdentity implements Scale {
    /** The set of values for both the scale's data space and visual space. */
    range: number[];
    /** Identity scales do not support `Bounds` and are therefore always valid. */
    isValid: boolean;
    constructor({ range }: IdentityScaleConfig);
    /**
     * The d3Scale used for computation.
     */
    get d3Scale(): scales.ScaleIdentity<never>;
    /** The set of values for the scale's data space. Since the range and domain are always equivalent,
     * this is here for Scale interface compatability. */
    get domain(): number[];
    /**
     * Computes a range value from a domain value.
     */
    compute: (value: number) => number;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: IdentityScaleConfig) => ScaleIdentity;
    /**
     * The default tick values for the scale. These are domain values, not range values.
     */
    get ticks(): number[];
}
/**
 * A scale that maps a discrete set of domain values to a continuous range of values by dividing the
 * continuous range into steps that are divided between padding and band widths.
 */
export declare class ScaleBand implements Scale {
    /** The discrete set of ordinal (or nominal) input data. */
    domain: string[];
    /** The bounds of the scale's visual space. */
    range: Bounds<number>;
    /** When `true`, ensures that `step` and `bandwidth` are integers. */
    round: boolean;
    /** A number between 0 and 1 that specifies how the outer padding in the scale's
     * range is distributed. 0.5 represents centering bands in their range. */
    align: number;
    /** A number between 0 and 1 that specifies how much spacing there is between bands
     * in proportion to band widths (e.g., when `padding` is 0.5, gaps and bands are
     * equal widths. */
    paddingInner: number;
    /** A number between 0 and 1 that specifies how much padding is placed on the outside
     * of bands (while still subtracting available space from the `range`). */
    paddingOuter: number;
    constructor({ domain, range, round, align, paddingInner, paddingOuter, padding, }: BandScaleConfig);
    /**
     * Whether or not the Bounds for the domain and range are valid (i.e., have a valid
     * min and max value).
     */
    get isValid(): boolean;
    /**
     * The final d3Scale used for computation.
     */
    get d3Scale(): scales.ScaleBand<string>;
    /**
     * Computes a range value from a domain value.
     */
    compute: (value: string) => number | undefined;
    /**
     * The width for a single band within the scale (this represents the width
     * of a bar in a traditional bar chart).
     */
    get bandwidth(): number;
    /**
     * The space bewteen two elements in the scale (this represents the width
     * of a bar + the padding between bars in a traditional bar chart).
     */
    get step(): number;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: BandScaleConfig) => ScaleBand;
}
/**
 * A scale that maps a discrete set of domain values to a continuous range of values by dividing the
 * continuous range into steps.
 */
export declare class ScalePoint implements Scale {
    /** The discrete set of ordinal (or nominal) input data. */
    domain: string[];
    /** The bounds of the scale's visual space. */
    range: Bounds<number>;
    /** When `true`, ensures that `step` and `bandwidth` are integers. */
    round: boolean;
    /** A number between 0 and 1 that specifies how the outer padding in the scale's
     * range is distributed. 0.5 represents centering bands in their range. */
    align: number;
    /** A number between 0 and 1 that specifies how much padding is placed on the outside
     * of the points (while still subtracting available space from the `range`). */
    padding: number;
    constructor({ domain, range, round, align, padding }: PointScaleConfig);
    /**
     * Whether or not the Bounds for the domain and range are valid (i.e., have a valid
     * min and max value).
     */
    get isValid(): boolean;
    /**
     * The final d3Scale used for computation.
     */
    get d3Scale(): scales.ScalePoint<string>;
    compute: (value: string) => number | undefined;
    /**
     * Always returns `0`. It's here for d3 compatability (where point scales are a special form
     * of band scale).
     */
    get bandwidth(): number;
    /**
     * The space bewteen two elements in the scale (this represents the width
     * of a bar + the padding between bars in a traditional bar chart).
     */
    get step(): number;
    /**
     * Creates a new scale of the same type and same properties. The options arg overrides
     * any set properties (like `Object.assign`).
     */
    derive: (options: BandScaleConfig) => ScaleBand;
}
export {};
//# sourceMappingURL=scale.d.ts.map