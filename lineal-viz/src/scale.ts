import 'ember-cached-decorator-polyfill';
import { tracked, cached } from '@glimmer/tracking';
import * as scales from 'd3-scale';
import { extent } from 'd3-array';

// Identity = 'identity',
// Time = 'time',
// Utc = 'utc',
//
// Diverging = 'diverging',
//
// Quantize = 'quantize',
// Quantile = 'quantile',
// Threshold = 'threshold',
//
// Ordinal = 'ordinal',
// Implicit = 'implicit',
//
// Band = 'band',
// Point = 'point',

type ValueSet = Array<any> | string;

interface ScaleConfig {
  domain?: ValueSet;
  range?: ValueSet;
  clamp?: boolean;
  nice?: boolean;

  // ScalePow only
  exponent?: number;
  // ScaleLog only
  base?: number;
}

// Ranges and domains can be specified using an expression similar
// to Rust's range expression. This validates the expression.
const NUMERIC_RANGE_DSL = /^(\d+)?\.\.(\d+)?$/;

export const parse = (input: string | number[]): Bounds | number[] => {
  if (input instanceof Array) return input;
  if (!NUMERIC_RANGE_DSL.test(input)) {
    throw new Error(
      'Invalid string provided as numeric range. Must match the syntax "1..1", where the min and the max are both optional (e.g., "1.." is valid).'
    );
  }

  const [minStr, maxStr] = input.split('..');
  const min = minStr ? parseInt(minStr, 10) : undefined;
  const max = maxStr ? parseInt(maxStr, 10) : undefined;

  return new Bounds(min, max);
};

export class Bounds {
  min: number | undefined;
  max: number | undefined;

  constructor(min?: number, max?: number) {
    this.min = min;
    this.max = max;
  }

  get isValid(): boolean {
    return this.min != undefined && this.max != undefined;
  }

  qualify(data: any[], accessor: string | ((datum: any) => number)): Bounds {
    if (this.min != undefined && this.max != undefined) return this;

    const fn = typeof accessor === 'string' ? (d: any) => d[accessor] : accessor;
    const [min, max] = extent(data, fn);
    if (typeof accessor === 'string' && (min == undefined || max == undefined)) {
      throw new Error(
        `Invalid extent for data set using field accessor "${accessor}". Is "${accessor}" defined in this dataset?`
      );
    }
    if (this.min == undefined) this.min = min;
    if (this.max == undefined) this.max = max;

    return this;
  }

  get bounds(): [number, number] {
    if (!this.isValid) {
      throw new Error(
        'Bounds have not been qualified! These bounds were not constructed with both a min and a max. Use `bounds.qualify` with a dataset to fill in the missing bounds'
      );
    }

    return [this.min as number, this.max as number];
  }
}

abstract class ScaleContinuous {
  @tracked domain: Bounds | number[];
  @tracked range: Bounds | number[];
  @tracked clamp: boolean = false;
  @tracked nice: boolean | number = false;

  constructor({ domain, range, clamp, nice }: ScaleConfig) {
    this.domain = domain ? parse(domain) : [];
    this.range = range ? parse(range) : [];
    this.clamp = clamp ?? false;
    this.nice = nice ?? false;
  }

  get scaleArgs(): [number[], number[]] {
    return [
      this.domain instanceof Bounds ? this.domain.bounds : this.domain,
      this.range instanceof Bounds ? this.range.bounds : this.range,
    ];
  }

  abstract get d3Scale(): scales.ScaleContinuousNumeric<number, number>;

  @cached get d3ScaleTreated(): scales.ScaleContinuousNumeric<number, number> {
    const scale = this.d3Scale;
    if (this.clamp) scale.clamp(true);
    if (this.nice && typeof this.nice === 'number') {
      scale.nice(this.nice);
    } else if (this.nice) {
      scale.nice();
    }

    return scale;
  }

  compute(value: number): number {
    return this.d3ScaleTreated(value);
  }
}

export class ScaleLinear extends ScaleContinuous {
  get d3Scale() {
    return scales.scaleLinear(...this.scaleArgs);
  }
}

export class ScalePow extends ScaleContinuous {
  @tracked exponent: number = 1;

  constructor(config: ScaleConfig) {
    super(config);
    this.exponent = config.exponent ?? 1;
  }

  get d3Scale() {
    return scales.scalePow(...this.scaleArgs).exponent(this.exponent);
  }
}

export class ScaleLog extends ScaleContinuous {
  @tracked base: number = 10;

  constructor(config: ScaleConfig) {
    super(config);
    this.base = config.base ?? 10;
  }

  get d3Scale() {
    return scales.scaleLog(...this.scaleArgs).base(this.base);
  }
}

export class ScaleSqrt extends ScaleContinuous {
  get d3Scale() {
    return scales.scaleSqrt(...this.scaleArgs);
  }
}

// TODO: This isn't typed as a continuous scale despite being a special form of linear scale.
// Maybe we can just not use d3's scaleIdentity here?
//
// export class ScaleIdentity extends ScaleContinuous {
//   get d3Scale() {
//     return scales.scaleIdentity(this.scaleArgs[1]);
//   }
// }

export class ScaleRadial extends ScaleContinuous {
  get d3Scale() {
    return scales.scaleRadial(...this.scaleArgs);
  }
}

// TODO: Time scales are just linear scales with dates for domain values
// So we should be able to get some code reuse here...but thinking required.
//
// export class ScaleTime extends ScaleContinuous {
//   get d3Scale() {
//     return scales.scaleTime(...this.scaleArgs);
//   }
// }
//   Utc = 'utc',

// Welp. This is just gonna have to be multiple classes
