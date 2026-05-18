/**
 * Copyright IBM Corp. 2020, 2026
 */
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
export default class Bounds<T> {
    /** The lower bound. When `undefined`, the Bounds instance is invalid. */
    min: T | undefined;
    /** The upper bound. When `undefined`, the Bounds instance is invalid. */
    max: T | undefined;
    private steps;
    /** True when the Bounds was constructed with an array with more than two
     * elements (a min, N pieces, a max). */
    get isPiecewise(): boolean;
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
    static parse(input: string | number[]): Bounds<number>;
    /**
     * TODO: Remove this when https://github.com/ef4/ember-auto-import/pull/512 is released.
     * Right now in the test-app, Lineal is executed twice (once for the app chunk and again
     * for the test chunk) which means instanceof checks may not work. Using this gnarly
     * duck-typing approach is a stopgap.
     */
    readonly __temp_duck_type_bounds: boolean;
    /**
     * Given optional min and max values, construct a Bounds of any type.
     *
     * @param [min] - the min value of the bounds, or `undefined` when not yet known.
     * @param [max] - the max value of the bounds, or `undefined` when not yet known.
     */
    constructor(min?: T | T[], max?: T);
    /**
     * True when the scale is "qualified" (i.e., has a valid `min` and `max` value).
     */
    get isValid(): boolean;
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
    qualify(data: any[], accessor: string | ((datum: any) => T)): Bounds<T>;
    /**
     * Creates a new Bounds identical to this one.
     */
    copy(): Bounds<T>;
    /**
     * A convenient getter for returning the `min` and `max` in a common
     * two element array format.
     *
     * @throws - When the Bounds instance is invalid.
     */
    get bounds(): T[];
}
//# sourceMappingURL=bounds.d.ts.map