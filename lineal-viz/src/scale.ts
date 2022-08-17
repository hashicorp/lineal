import 'ember-cached-decorator-polyfill';
import { tracked, cached } from '@glimmer/tracking';
import * as scales from 'd3-scale';
import Bounds from './bounds';

// Diverging = 'diverging',
//
// Quantize = 'quantize',
// Quantile = 'quantile',
// Threshold = 'threshold',
//
// Ordinal = 'ordinal',
//
// Implicit = 'implicit',
// Identity = 'identity',
// Band = 'band',
// Point = 'point',

type ValueSet = number[] | string;

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

interface DateScaleConfig {
  domain?: Date[];
  range?: ValueSet;
  clamp?: boolean;
  nice?: boolean;
}

abstract class ScaleContinuous {
  @tracked domain: Bounds<number> | number[];
  @tracked range: Bounds<number> | number[];
  @tracked clamp: boolean = false;
  @tracked nice: boolean | number = false;

  constructor({ domain, range, clamp, nice }: ScaleConfig = {}) {
    this.domain = domain ? Bounds.parse(domain) : new Bounds();
    this.range = range ? Bounds.parse(range) : new Bounds();
    this.clamp = clamp ?? false;
    this.nice = nice ?? false;
  }

  get scaleArgs(): [number[], number[]] {
    return [
      this.domain instanceof Bounds ? this.domain.bounds : this.domain,
      this.range instanceof Bounds ? this.range.bounds : this.range,
    ];
  }

  abstract get _d3Scale(): scales.ScaleContinuousNumeric<number, number>;

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

  compute(value: number): number {
    return this.d3Scale(value);
  }
}

export class ScaleLinear extends ScaleContinuous {
  get _d3Scale() {
    return scales.scaleLinear(...this.scaleArgs);
  }
}

export class ScalePow extends ScaleContinuous {
  @tracked exponent: number = 1;

  constructor(config: ScaleConfig) {
    super(config);
    this.exponent = config.exponent ?? 1;
  }

  get _d3Scale() {
    return scales.scalePow(...this.scaleArgs).exponent(this.exponent);
  }
}

export class ScaleLog extends ScaleContinuous {
  @tracked base: number = 10;

  constructor(config: ScaleConfig) {
    super(config);
    this.base = config.base ?? 10;
  }

  get _d3Scale() {
    return scales.scaleLog(...this.scaleArgs).base(this.base);
  }
}

export class ScaleSqrt extends ScaleContinuous {
  get _d3Scale() {
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
  get _d3Scale() {
    return scales.scaleRadial(...this.scaleArgs);
  }
}

abstract class AbstractScaleTime {
  @tracked domain: Bounds<Date> | Date[];
  @tracked range: Bounds<number> | number[];
  @tracked clamp: boolean = false;
  @tracked nice: boolean | number = false;

  constructor({ domain, range, clamp, nice }: DateScaleConfig = {}) {
    this.domain = domain ?? new Bounds();
    this.range = range ? Bounds.parse(range) : new Bounds();
    this.clamp = clamp ?? false;
    this.nice = nice ?? false;
  }

  get scaleArgs(): [Date[], number[]] {
    return [
      this.domain instanceof Bounds ? this.domain.bounds : this.domain,
      this.range instanceof Bounds ? this.range.bounds : this.range,
    ];
  }

  abstract get _d3Scale(): scales.ScaleTime<number, number>;

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

  compute(value: Date): number {
    return this.d3Scale(value);
  }
}

export class ScaleTime extends AbstractScaleTime {
  get _d3Scale() {
    return scales.scaleTime(...this.scaleArgs);
  }
}

export class ScaleUtc extends AbstractScaleTime {
  get _d3Scale() {
    return scales.scaleUtc(...this.scaleArgs);
  }
}
