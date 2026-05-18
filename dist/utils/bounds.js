import { extent } from 'd3-array';
import { tracked } from '@glimmer/tracking';
import { g, i } from 'decorator-transforms/runtime-esm';

/**
 * Copyright IBM Corp. 2020, 2026
 */

const NUMBER_PATTERN = '[+-]?\\d+.?\\d*';
const NUMERIC_RANGE_DSL = new RegExp(`^(${NUMBER_PATTERN})?\\.\\.(${NUMBER_PATTERN})?$`);

/**
 * A utility class for modeling a min and max value of a type. Bounds can also be constructed
 * and passed around before they are "qualified" (i.e., a Bounds can have a `min` but no `max`,
 * a `max` but no `min`, or even neither a `min` or `max`).
 *
 * Being able to create tokens that represent future bounds facilitates in the declarative API
 * used throughout Lineal.
 *
 * When a Bounds instance is ready to be used, it can be qualified with a dataset to compute
 * the `min` and `max` values based on an accessor function, like how the `extent` function
 * from the d3-array package works.
 *
 * @template T - The min/max data type (typically `number`).
 */
class Bounds {
  static {
    g(this.prototype, "min", [tracked]);
  }
  #min = (i(this, "min"), void 0);
  /** The lower bound. When `undefined`, the Bounds instance is invalid. */
  static {
    g(this.prototype, "max", [tracked]);
  }
  #max = (i(this, "max"), void 0);
  /** The upper bound. When `undefined`, the Bounds instance is invalid. */
  // TODO: Right now it's possible to first create a piecewise Bounds
  // and then update the min or the max to be within the steps set in the
  // constructor. Since piecewise Bounds read straight from steps, setting min
  // or max has no impact on the bounds getter (which is used in scales). It still
  // results in a bad surprise from a developer perspective.
  steps;

  /** True when the Bounds was constructed with an array with more than two
   * elements (a min, N pieces, a max). */
  get isPiecewise() {
    return this.steps.length > 2;
  }

  /**
   * Parses a Bounds instance from a Rust-style range expression.
   *
   * ```
   * const bounds = Bounds.parse('0..');
   * console.log(bounds.min, bounds.max); // 0, undefined
   *
   * const complete = Bounds.parse('-100..100');
   * console.log(complete.min, complete.max); // -100, 100
   * ```
   *
   * @static
   * @param input - A Rust-style expression as a string or a numeric array for convience.
   * @throws - When the provided string is malformed.
   * @returns - Either a Bounds object or a numeric array (the same one passed as input).
   */
  static parse(input) {
    if (input instanceof Array) return new Bounds(input);
    if (!NUMERIC_RANGE_DSL.test(input)) {
      throw new Error('Invalid string provided as numeric range. Must match the syntax "1..1", where the min and the max are both optional (e.g., "1.." is valid).');
    }
    const [minStr, maxStr] = input.split('..');
    const min = minStr ? parseFloat(minStr) : undefined;
    const max = maxStr ? parseFloat(maxStr) : undefined;
    return new Bounds(min, max);
  }

  /**
   * TODO: Remove this when https://github.com/ef4/ember-auto-import/pull/512 is released.
   * Right now in the test-app, Lineal is executed twice (once for the app chunk and again
   * for the test chunk) which means instanceof checks may not work. Using this gnarly
   * duck-typing approach is a stopgap.
   */
  __temp_duck_type_bounds = true;

  /**
   * Given optional min and max values, construct a Bounds of any type.
   *
   * @param [min] - the min value of the bounds, or `undefined` when not yet known.
   * @param [max] - the max value of the bounds, or `undefined` when not yet known.
   */
  constructor(min, max) {
    if (min instanceof Array) {
      if (min.length === 0) {
        this.min = undefined;
        this.max = undefined;
        this.steps = [];
      } else if (min.length === 1) {
        this.min = min[0];
        this.max = min[0];
        this.steps = [min[0], min[0]];
      } else {
        this.min = min[0];
        this.max = min[min.length - 1];
        this.steps = min.slice();
      }
    } else {
      this.min = min;
      this.max = max;
      this.steps = min != undefined && max != undefined ? [min, max] : [];
    }
  }

  /**
   * True when the scale is "qualified" (i.e., has a valid `min` and `max` value).
   */
  get isValid() {
    return this.min != undefined && this.max != undefined;
  }

  /**
   * Replaces `undefined` `min` and `max` values with derived bounds from a provided dataset
   * using the provided accessor field or function.
   *
   * ```
   * const data = [
   *   { a: 0, b: 3 },
   *   { a: -2, b: 5 },
   *   { a: 10, b: 5 },
   * ];
   *
   * const aBounds = Bounds.parse('..'); // No min or max
   * aBounds.qualify(data, 'a');
   * console.log(aBounds.min, aBounds.max); // -2, 10
   *
   * const bBounds = Bounds.parse('0..'); // Set min, no max
   * bBounds.qualify(data, 'b');
   * console.log(bBounds.min, bBounds.max); // 0, 5
   * ```
   *
   * @param data - An array representing a dataset.
   * @param  accessor - A function that returns a value for a record in the dataset.
   *                    When the accessor is a `string`, it is interpreted as a field
   *                    accessor (e.g., `'foo'` becomes `d => d.foo`)
   * @throws - When a `min` and `max` cannot be computed using the given dataset and accessor.
   */
  qualify(data, accessor) {
    if (this.isPiecewise) {
      throw new Error(`Cannot qualify a piecewise Bounds. The steps of this Bounds are "${JSON.stringify(this.steps)}".`);
    }
    if (this.min != undefined && this.max != undefined) return this;
    const fn = typeof accessor === 'string' ? d => d[accessor] : accessor;
    const [min, max] = extent(data, fn);
    if (typeof accessor === 'string' && (min == undefined || max == undefined)) {
      throw new Error(`Invalid extent for data set using field accessor "${accessor}". Is "${accessor}" defined in this dataset?`);
    }
    if (this.min == undefined) this.min = min;
    if (this.max == undefined) this.max = max;
    this.steps = [this.min, this.max];
    return this;
  }

  /**
   * Creates a new Bounds identical to this one.
   */
  copy() {
    return this.isPiecewise ? new Bounds(this.steps) : new Bounds(this.min, this.max);
  }

  /**
   * A convenient getter for returning the `min` and `max` in a common
   * two element array format.
   *
   * @throws - When the Bounds instance is invalid.
   */
  get bounds() {
    if (!this.isValid) {
      throw new Error('Bounds have not been qualified! These bounds were not constructed with both a min and a max. Use `bounds.qualify` with a dataset to fill in the missing bounds');
    }
    if (this.isPiecewise) return this.steps;
    return [this.min, this.max];
  }
}

export { Bounds as default };
//# sourceMappingURL=bounds.js.map
