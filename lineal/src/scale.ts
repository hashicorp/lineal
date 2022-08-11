import { tracked } from '@glimmer/tracking';
import * as scales from 'd3-scale';

enum ScaleType {
  Linear = 'linear',
  Pow = 'pow', // exponent
  Log = 'log', // base
  Sqrt = 'sqrt',
  Identity = 'identity',
  Radial = 'radial',
  Time = 'time',
  Utc = 'utc',
  Diverging = 'diverging',
  Quantize = 'quantize',
  Quantile = 'quantile',
  Threshold = 'threshold',
  Ordinal = 'ordinal',
  Implicit = 'implicit',
  Band = 'band',
  Point = 'point',
}

type ValueSet = Array<any> | string;

interface ScaleConfig {
  domain?: ValueSet;
  range?: ValueSet;
  clamp?: boolean;
  nice?: boolean;
}

// Ranges and domains can be specified using an expression similar
// to Rust's range expression. This validates the expression.
const NUMERIC_RANGE_DSL = /^(\d+)?\.\.(\d+)?$/;

// This is a bit cumbersome, but it gets us type guarantees and avoids runtime
// lookups into d3 (e.g., scales[`scale${this.scaleType}`]).
const D3_SCALE_MAP = {
  [ScaleType.Linear]: scales.scaleLinear,
  [ScaleType.Pow]: scales.scalePow,
  [ScaleType.Log]: scales.scaleLog,
  [ScaleType.Sqrt]: scales.scaleSqrt,
  [ScaleType.Identity]: scales.scaleIdentity,
  [ScaleType.Radial]: scales.scaleRadial,
  [ScaleType.Time]: scales.scaleTime,
  [ScaleType.Utc]: scales.scaleUtc,
  [ScaleType.Diverging]: scales.scaleDiverging,
  [ScaleType.Quantize]: scales.scaleQuantize,
  [ScaleType.Quantile]: scales.scaleQuantile,
  [ScaleType.Threshold]: scales.scaleThreshold,
  [ScaleType.Ordinal]: scales.scaleOrdinal,
  [ScaleType.Implicit]: scales.scaleImplicit,
  [ScaleType.Band]: scales.scaleBand,
  [ScaleType.Point]: scales.scalePoint,
};

export default class Scale {
  @tracked scaleType: ScaleType = ScaleType.Linear;

  // Used by Pow scales
  @tracked exponent: number = 1;

  // Used by Log scales
  @tracked base: number = 10;

  @tracked domain: Array<any>;
  @tracked range: Array<any>;

  @tracked clamp: boolean = false;
  @tracked nice: boolean = false;

  constructor(
    scaleType: ScaleType,
    { domain, range, clamp, nice }: ScaleConfig
  ) {
    this.scaleType = scaleType;

    this.domain = domain ? this.#parse(domain) : [];
    this.range = range ? this.#parse(range) : [];
    this.clamp = clamp ?? this.clamp;
    this.nice = nice ?? this.nice;
  }

  #parse(input: string | Array<any>) {
    if (input instanceof Array) return input;
    if (!NUMERIC_RANGE_DSL.test(input)) {
      throw new Error(
        'Invalid string provided as numeric range. Must match the syntax "1..1", where the min and the max are both optional (e.g., "1.." is valid).'
      );
    }

    const [minStr, maxStr] = input.split('..');
    const min = minStr ? parseInt(minStr, 10) : null;
    const max = maxStr ? parseInt(maxStr, 10) : null;

    return [min, max];
  }

  get d3ScaleFunction() {
    const scaleFunction = D3_SCALE_MAP[this.scaleType];
    if (!scaleFunction) {
      throw new Error(`No d3 scale found for ScaleType "${this.scaleType}".`);
    }
    return scaleFunction;
  }

  get d3Scale() {
    const scale = this.d3Scale(this.range, this.domain);
    if (this.clamp) scale.clamp();
    if (this.nice) scale.nice();
    if (this.scaleType === ScaleType.Pow) {
      scale.exponent(this.exponent);
    }
    if (this.scaleType == ScaleType.Log) {
      scale.base(this.base);
    }

    return scale;
  }

  compute(value: any) {
    return this.d3Scale(value);
  }
}
