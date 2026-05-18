/**
 * Copyright IBM Corp. 2020, 2026
 */
import * as shape from 'd3-shape';
import { Encoding } from '../utils/encoding.ts';
import type { Accessor } from '../utils/encoding.ts';
type OrderFn = (series: shape.Series<any, any>) => number[];
type OffsetFn = (series: shape.Series<any, any>[], order: Iterable<number>) => void;
type Direction = 'vertical' | 'horizontal';
type D3StackSeriesPoint = shape.SeriesPoint<{
    [key: string]: number;
}>;
/**
 * The set of D3 Stack orders to be referenced by string.
 * [Learn more about D3 Stack orders.](https://github.com/d3/d3-shape#stack-orders)
 */
export declare const ORDERS: {
    [key: string]: OrderFn;
};
/**
 * The set of D3 Stack offsets to be referenced by string.
 * [Learn more about D3 Stack offsets.](https://github.com/d3/d3-shape#stack-offsets)
 */
export declare const OFFSETS: {
    [key: string]: OffsetFn;
};
/**
 * The Stack transform is constructed with a configuration object styled after Mark args.
 * This includes x and y accessors (for spatial positioning) and a z accessor (for determining
 * how to divide a dataset for stacking). Additional arguments control how the stacking
 * transform is performed.
 */
export interface StackConfig {
    /** Record-based data, like what would be passed to a Mark component. */
    data: any[];
    /** How the x-coordinate of a datum should be determined. */
    x: Accessor | string;
    /** How the y-coordinate of a datum should be determined. */
    y: Accessor | string;
    /** How the dataset should be divided into data series to be stacked. */
    z: Accessor | string;
    /** The algorithm that should be used to determine the order of the stacked data series. */
    order?: string;
    /** The algorithm that should be used to determine the offset of the stacked data series. */
    offset?: string;
    /**
     * When true, the order of stacked data series is determined initially and never changed
     * when the data changes.
     */
    stable?: boolean;
    /**
     * Which coordinate should be stacked and which should be independent (y stacks when vertical,
     * x stacks when horizontal). The default is vertical.
     */
    direction?: Direction;
}
/**
 * When a dataset is stacked horizontally, a StackDatumHorizontal represents a single
 * data point within a series within the stack.
 */
export interface StackDatumHorizontal {
    x0: number;
    x1: number;
    x: number;
    y: any;
    data: {
        [key: string]: any;
    };
}
/**
 * When a dataset is stacked vertically, a StackDatumVertical represents a single
 * data point within a series within the stack.
 */
export interface StackDatumVertical {
    y0: number;
    y1: number;
    y: number;
    x: any;
    data: {
        [key: string]: any;
    };
}
/**
 * When calling `myStack.stack` on a horizontal stack, a single datum is returned with the
 * addition of the key that the datum comes from.
 */
export interface KeyedStackDatumHorizontal extends StackDatumHorizontal {
    key: string;
}
/**
 * When calling `myStack.stack` on a vertical stack, a single datum is returned with the
 * addition of the key that the datum comes from.
 */
export interface KeyedStackDatumVertical extends StackDatumVertical {
    key: string;
}
/**
 * A series within a stack is an array with two additional properties: `key` that represents
 * the name of the series (derived from the `z` encoding) and `index` that represents the
 * position of the series in the stack.
 *
 * This matches the shapes of series within D3 stacks.
 */
export interface StackSeriesHorizontal extends Array<StackDatumHorizontal> {
    key: string;
    index: number;
    visualOrder: number;
}
/**
 * A series within a stack is an array with two additional properties: `key` that represents
 * the name of the series (derived from the `z` encoding) and `index` that represents the
 * position of the series in the stack.
 *
 * This matches the shapes of series within D3 stacks.
 */
export interface StackSeriesVertical extends Array<StackDatumVertical> {
    key: string;
    index: number;
    visualOrder: number;
}
export declare const verticalStackMap: (d: D3StackSeriesPoint) => StackDatumVertical;
export declare const horizontalStackMap: (d: D3StackSeriesPoint) => StackDatumHorizontal;
/**
 * A transformation class to convert record data into stacked data.
 *
 * ```ts
 * import Stack from '@lineal-viz/transforms/stack';
 *
 *  const stack = new Stack({
 *    // Encodings
 *    x: 'x',
 *    y: 'y',
 *    z: 'group', // The dimension to "stack" on
 *
 *    // The direction to stack (also determines the 'value' encoding, here it is y)
 *    direction: 'vertical', // This is also the default
 *
 *    // The data
 *    data: [
 *      { x: 1, y: 3, group: 'A' },
 *      { x: 1, y: 5, group: 'B' },
 *      { x: 1, y: 9, group: 'C' },
 *    ],
 *  });
 * ```
 *
 * A stack object will then lazily compute a stacked version of the same data along the `z`
 * encoding when accessing `stack.data`.
 *
 * ```ts
 * console.log(stack.data);
 *
 * // [
 * //   [ { x: 1, y0: 0, y1: 3, y: 3, data: {...} } ],
 * //   [ { x: 1, y0: 3, y1: 8, y: 8, data: {...} } ],
 * //   [ { x: 1, y0: 8, y1: 17, y: 17, data: {...} } ],
 * // ]
 * ```
 *
 * This transformation is meant to be used with Area and Bar marks to create the common stacked area
 * and stacked bar visualization. Order and Offset options allow for creating specialized variations
 * of these charts, such as stream graphs and baseline-aligned bar charts.
 */
export default class Stack {
    #private;
    /** Tracked - The data passed into the Stack constructor. */
    dataIn: any[];
    /** Tracked - The D3 stack order algorithm used when stacking data. */
    order: OrderFn;
    /** Tracked - The D3 stack offset algorithm used when stacking data. */
    offset: OffsetFn;
    _stable: boolean;
    /** Tracked - How the x encoding in the dataset is accessed. */
    xAccessor: Accessor | string;
    /** Tracked - How the y encoding in the dataset is accessed. */
    yAccessor: Accessor | string;
    /** Tracked - How the z encoding in the dataset is accessed. The z encoding is the property
     * used to split the dataset into series. */
    zAccessor: Accessor | string;
    /** Tracked - Whether the stack should go vertically (y0, y1) or horizontally (x0, x1). */
    direction: Direction;
    constructor({ order, offset, data, direction, x, y, z, stable, }: StackConfig);
    set stable(val: boolean);
    get stable(): boolean;
    get x(): Encoding;
    get y(): Encoding;
    get z(): Encoding;
    get categories(): any[];
    /**
     * An intermediate data representation where data has been converted from a record format
     * into a tabular format, where rows are determined by the ID field (x when direction is
     * vertical, y when direction is horizontal) and the Cell field (the opposite of the ID field)
     * after grouping records by the z accessor.
     *
     * ```
     * [
     *   { x: 1, y: 5, group: 'A' },
     *   { x: 1, y: 10, group: 'B' },
     *   { x: 1, y: 3, group: 'C' },
     * ]
     * ```
     *
     * Becomes
     *
     * ```
     * [
     *   { x: 1, A: 5, B: 10, C: 3 }
     * ]
     * ```
     */
    get table(): any[];
    /**
     * The data passed to the constructor (or `stack.dataIn`) transformed into a stack.
     *
     * ```
     * [
     *   { x: 1, y: 5, group: 'A' },
     *   { x: 1, y: 10, group: 'B' },
     *   { x: 1, y: 3, group: 'C' },
     *   { x: 2, y: 7, group: 'A' },
     *   { x: 2, y: 8, group: 'B' },
     *   { x: 2, y: 5, group: 'C' },
     * ]
     * ```
     *
     * Becomes
     *
     * ```
     * [
     *   {
     *     0: { x: 1, y0: 0, y1: 5, y: 5, data: { ... } },
     *     1: { x: 2, y0: 0, y1: 7, y: 7, data: { ... } },
     *     key: 'A',
     *     index: 0,
     *   },
     *   {
     *     0: { x: 1, y0: 5, y1: 15, y: 15, data: { ... } },
     *     1: { x: 2, y0: 7, y1: 15, y: 15, data: { ... } },
     *     key: 'B',
     *     index: 1,
     *   },
     *   {
     *     0: { x: 1, y0: 15, y1: 18, y: 18, data: { ... } },
     *     1: { x: 2, y0: 15, y1: 20, y: 20, data: { ... } },
     *     key: 'C',
     *     index: 2,
     *   }
     * ]
     * ```
     *
     * When `stack.direction` is horizontal, instead of the stack having `y0` and `y1`
     * properties, it will have `x0` and `x1` properties.
     */
    get data(): StackSeriesVertical[] | StackSeriesHorizontal[];
    /**
     * A bound function (for helper compatibility) that takes a slice of data that matches
     * the shape of `stack.dataIn` and stacks just the slice using the persisted series order
     * from the initial stacking of the complete dataset.
     *
     * This allows for composability with interactors which may be operating on the original
     * record-based dataset instead of the stack transformed dataset.
     *
     * @param slice - A slice of data that matches properties with the original data
     *                for the stack (the same encodings will be used).
     */
    stack: (slice: any[]) => KeyedStackDatumVertical[] | KeyedStackDatumHorizontal[];
    get stackedCategories(): string[];
}
export {};
//# sourceMappingURL=stack.d.ts.map