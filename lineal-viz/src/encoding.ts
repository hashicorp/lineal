/**
 * Copyright IBM Corp. 2020, 2026
 */

export type AccessorFn = (d: any) => any;
export type Accessor = string | number | AccessorFn;

/**
 * A utility class that contains an accessor function
 * and metadata.
 *
 * Encodings are used by marks to model what properties of
 * a mark can be "encoded" (derived from a scale and a dataset).
 */
export class Encoding {
  /** The name of a the field when the Encoding is using a field accessor;
   * `undefined` otherwise. */
  field?: string;
  /** The accessor function that will return the appropriate value from
   * a dataset for the encoding. */
  accessor: AccessorFn;

  /**
   * Creates an Accessor and captures metadata.
   *
   * ```
   * const fieldAccessor = new Accessor('avg');
   * const customAccessor = new Accessor(d => d.high - d.low);
   * const staticAccessor = new Accessor(12);
   *
   * const datum = {
   *   avg: 100,
   *   high: 112,
   *   low: 78,
   * };
   *
   * console.log(fieldAccessor.accessor(datum)); // 100
   * console.log(customAccessor.accessor(datum)); // 34
   * console.log(staticAccessor.accessor(datum)); // 12
   * ```
   *
   * @param accessor - When the accessor is a `function`, the function is the accessor.
   *                   When the accessor is a `string`, the string is a field accessor.
   *                   When the accessor is a `number`, the accessor always returns that number.
   */
  constructor(accessor: Accessor) {
    if (typeof accessor === 'string') {
      this.field = accessor;
      this.accessor = (d: any) => d[accessor];
    } else if (typeof accessor === 'number') {
      this.accessor = () => accessor;
    } else {
      this.accessor = accessor;
    }
  }
}
