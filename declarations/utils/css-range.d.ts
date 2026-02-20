/**
 * Copyright IBM Corp. 2020, 2026
 */
/**
 * Used with scales that support discrete ranges (quantize, quantile, threshold, and ordinal)
 * to dynamically construct ranges that have incrementing strings. These are then used by marks
 * to specify encodings as CSS classes instead of as inline attribute values.
 */
export default class CSSRange {
    name: string;
    /**
     * Creates a class name generator using the provided name as a prefix.
     *
     * ```
     * const range = new CSSRange('blues');
     * const classes = range.spread(3);
     * console.log(classes);
     * // [
     * //   'blues blues-1 blues-3-1',
     * //   'blues blues-2 blues-3-2',
     * //   'blues blues-3 blues-3-3'
     * // ]
     * ```
     *
     * @param name - The prefix for the generated class names.
     */
    constructor(name: string);
    /**
     * Generates a collection of 1 indexed class name sets using the CSSRange's name.
     * The class name set includes the name itself as well as the name with the index as
     * well as the name with the index and the count. This way color ramps can be defined
     * in CSS with as many fallback options as possible to prevent repetive class definitions.
     *
     * @param count - The number of class name sets to yield.
     * @returns - An array of class name sets with a length equal to `count`.
     */
    spread(count: number): string[];
    copy(): CSSRange;
}
//# sourceMappingURL=css-range.d.ts.map