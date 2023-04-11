import * as shape from 'd3-shape';
import { group } from 'd3-array';
import { Accessor, Encoding } from '../encoding';
import { tracked, cached } from '@glimmer/tracking';

type OrderFn = (series: shape.Series<any, any>) => number[];
type OffsetFn = (series: shape.Series<any, any>, order: Iterable<number>) => void;
type Direction = 'vertical' | 'horizontal';
type D3StackSeries = shape.Series<{ [key: string]: number }, string>;
type D3StackSeriesPoint = shape.SeriesPoint<{ [key: string]: number }>;

export const ORDERS: { [key: string]: OrderFn } = {
  appearance: shape.stackOrderAppearance,
  ascending: shape.stackOrderAscending,
  descending: shape.stackOrderDescending,
  insideOut: shape.stackOrderInsideOut,
  none: shape.stackOrderNone,
  reverse: shape.stackOrderReverse,
};

export const OFFSETS: { [key: string]: OffsetFn } = {
  expand: shape.stackOffsetExpand,
  diverging: shape.stackOffsetDiverging,
  none: shape.stackOffsetNone,
  silhouette: shape.stackOffsetSilhouette,
  wiggle: shape.stackOffsetWiggle,
};

export interface StackConfig {
  order?: string;
  offset?: string;
  data: any[];
  direction?: Direction;
  x: Accessor | string;
  y: Accessor | string;
  z: Accessor | string;
}

export interface StackDatumHorizontal {
  x0: number;
  x1: number;
  x: number;
  y: any;
  data: { [key: string]: any };
}

export interface StackDatumVertical {
  y0: number;
  y1: number;
  y: number;
  x: any;
  data: { [key: string]: any };
}

export interface StackSeriesHorizontal extends Array<StackDatumHorizontal> {
  key: string;
  index: number;
}

export interface StackSeriesVertical extends Array<StackDatumVertical> {
  key: string;
  index: number;
}

export const verticalStackMap = (d: D3StackSeriesPoint): StackDatumVertical => ({
  y0: d[0],
  y1: d[1],
  y: d[1],
  x: d.data.x,
  data: d.data,
});

export const horizontalStackMap = (d: D3StackSeriesPoint): StackDatumHorizontal => ({
  x0: d[0],
  x1: d[1],
  x: d[1],
  y: d.data.y,
  data: d.data,
});

const tag = (
  arr: StackDatumVertical[] | StackDatumHorizontal[],
  { key, index }: D3StackSeries
): StackSeriesVertical | StackSeriesHorizontal => Object.assign(arr, { key, index });

export default class Stack {
  @tracked dataIn: any[] = [];

  // TODO: People will probably want to set these via string since they
  // are constructed via string?
  @tracked order: OrderFn;
  @tracked offset: OffsetFn;

  @tracked xAccessor: Accessor | string;
  @tracked yAccessor: Accessor | string;
  @tracked zAccessor: Accessor | string;
  @tracked direction: Direction;

  _categories: string[] | null = null;

  constructor({ order, offset, data, direction, x, y, z }: StackConfig) {
    this.offset = offset ? OFFSETS[offset] ?? OFFSETS.none : OFFSETS.none;
    this.order = order
      ? ORDERS[order] ?? ORDERS.none
      : this.offset === OFFSETS.wiggle
      ? ORDERS.insideOut
      : ORDERS.none;

    this.xAccessor = x;
    this.yAccessor = y;
    this.zAccessor = z;
    this.direction = direction ?? 'vertical';

    this.dataIn = data;
  }

  @cached get x() {
    return new Encoding(this.xAccessor);
  }

  @cached get y() {
    return new Encoding(this.yAccessor);
  }

  @cached get z() {
    return new Encoding(this.zAccessor);
  }

  @cached get categories(): any[] {
    return Array.from(new Set(this.dataIn.map((d) => this.z.accessor(d))));
  }

  @cached get table() {
    // Transform from records into a table using the x-accessor as ID and the y-accessor as the cell value
    // (or the y-accessor as ID and the x-accessor as the cell value when stacked horizontally)

    const categories = this.categories;
    const id = this.direction === 'vertical' ? this.x : this.y;
    const cell = this.direction === 'vertical' ? this.y : this.x;
    const idField = this.direction === 'vertical' ? 'x' : 'y';

    const grouped = group(this.dataIn, id.accessor, this.z.accessor);

    return Array.from(grouped).reduce((rows, [idVal, records]) => {
      rows.push({
        [idField]: idVal,
        ...categories.reduce((columns, category) => {
          // It is assumed that there is a single record per category, otherwise it would
          // mean there were duplicte records in the source data.
          columns[category] = cell.accessor(records.get(category)?.[0] ?? {});
          return columns;
        }, {}),
      });
      return rows;
    }, [] as any[]);
  }

  @cached get data(): StackSeriesVertical[] | StackSeriesHorizontal[] {
    // Convert the table of data into stacks of data. Once data has been computed once,
    // the category order is persisted for future data stacking. This prevents the jarring
    // visual re-ordering of series.
    const stacker = shape
      .stack()
      .order(this._categories ? ORDERS.none : this.order)
      .offset(this.offset)
      .keys(this._categories ?? this.categories);

    const d3Stack = stacker(this.table);

    if (!this._categories) {
      this._categories = d3Stack.sort((a, b) => a.index - b.index).map((d) => d.key);
    }

    const isVertical = this.direction === 'vertical';

    // Convert the array indexing format to a more Ember friendly property accessor format
    return isVertical
      ? d3Stack.map((series) => tag(series.map(verticalStackMap), series) as StackSeriesVertical)
      : d3Stack.map(
          (series) => tag(series.map(horizontalStackMap), series) as StackSeriesHorizontal
        );
  }
}
