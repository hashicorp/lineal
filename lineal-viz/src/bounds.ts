import { extent } from 'd3-array';

// Ranges and domains can be specified using an expression similar
// to Rust's range expression. This validates the expression.
const NUMERIC_RANGE_DSL = /^(\d+)?\.\.(\d+)?$/;

export default class Bounds<T> {
  min: T | undefined;
  max: T | undefined;

  static parse(input: string | number[]): Bounds<number> | number[] {
    if (input instanceof Array) return input;
    if (!NUMERIC_RANGE_DSL.test(input)) {
      throw new Error(
        'Invalid string provided as numeric range. Must match the syntax "1..1", where the min and the max are both optional (e.g., "1.." is valid).'
      );
    }

    const [minStr, maxStr] = input.split('..');
    const min = minStr ? parseInt(minStr, 10) : undefined;
    const max = maxStr ? parseInt(maxStr, 10) : undefined;

    return new Bounds<number>(min, max);
  }

  constructor(min?: T, max?: T) {
    this.min = min;
    this.max = max;
  }

  get isValid(): boolean {
    return this.min != undefined && this.max != undefined;
  }

  qualify(data: any[], accessor: string | ((datum: any) => number)): Bounds<T> {
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

  get bounds(): [T, T] {
    if (!this.isValid) {
      throw new Error(
        'Bounds have not been qualified! These bounds were not constructed with both a min and a max. Use `bounds.qualify` with a dataset to fill in the missing bounds'
      );
    }

    return [this.min as T, this.max as T];
  }
}
