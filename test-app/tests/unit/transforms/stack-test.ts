import { module, test } from 'qunit';
import {
  stack as d3Stack,
  stackOrderDescending,
  stackOrderReverse,
  stackOrderNone,
  stackOrderInsideOut,
  stackOffsetExpand,
  stackOffsetSilhouette,
  stackOffsetNone,
  stackOffsetWiggle,
  Series,
} from 'd3-shape';
import Stack, {
  verticalStackMap,
  StackDatumVertical,
  StackSeriesVertical,
} from '@lineal-viz/lineal/transforms/stack';

type SeriesStd = Series<{ [key: string]: number }, string>;

const tag = (
  arr: StackDatumVertical[],
  { key, index }: SeriesStd
): StackSeriesVertical => Object.assign(arr, { key, index });

const convert = (data: SeriesStd[]) =>
  data.map((series) => tag(series.map(verticalStackMap), series));

const sortByIndex = (a: SeriesStd, b: SeriesStd) => a.index - b.index;

const TEST_DATA = [
  { day: 'Sunday', hour: 0, value: 1 },
  { day: 'Sunday', hour: 1, value: 2 },
  { day: 'Sunday', hour: 2, value: 1 },
  { day: 'Sunday', hour: 3, value: 2 },
  { day: 'Sunday', hour: 4, value: 1 },
  { day: 'Sunday', hour: 5, value: 2 },
  { day: 'Sunday', hour: 6, value: 1 },
  { day: 'Sunday', hour: 7, value: 2 },
  { day: 'Sunday', hour: 8, value: 1 },
  { day: 'Sunday', hour: 9, value: 2 },
  { day: 'Sunday', hour: 10, value: 1 },
  { day: 'Sunday', hour: 11, value: 2 },

  { day: 'Monday', hour: 0, value: 1 },
  { day: 'Monday', hour: 1, value: 2 },
  { day: 'Monday', hour: 2, value: 3 },
  { day: 'Monday', hour: 3, value: 4 },
  { day: 'Monday', hour: 4, value: 5 },
  { day: 'Monday', hour: 5, value: 6 },
  { day: 'Monday', hour: 6, value: 7 },
  { day: 'Monday', hour: 7, value: 8 },
  { day: 'Monday', hour: 8, value: 9 },
  { day: 'Monday', hour: 9, value: 10 },
  { day: 'Monday', hour: 10, value: 11 },
  { day: 'Monday', hour: 11, value: 12 },

  { day: 'Tuesday', hour: 0, value: 5 },
  { day: 'Tuesday', hour: 1, value: 0 },
  { day: 'Tuesday', hour: 2, value: 5 },
  { day: 'Tuesday', hour: 3, value: 0 },
  { day: 'Tuesday', hour: 4, value: 10 },
  { day: 'Tuesday', hour: 5, value: 0 },
  { day: 'Tuesday', hour: 6, value: 15 },
  { day: 'Tuesday', hour: 7, value: 0 },
  { day: 'Tuesday', hour: 8, value: 20 },
  { day: 'Tuesday', hour: 9, value: 0 },
  { day: 'Tuesday', hour: 10, value: 25 },
  { day: 'Tuesday', hour: 11, value: 0 },
];

module('Unit | Transforms | Stack', function () {
  test('When given an order, offset, direction, encodings, and data, a stack stacks input data', function (assert) {
    const stack = new Stack({
      data: TEST_DATA,
      direction: 'vertical',
      x: 'hour',
      y: 'value',
      z: 'day',
    });

    assert.deepEqual(
      stack.table[0],
      {
        x: 0,
        Sunday: 1,
        Monday: 1,
        Tuesday: 5,
      },
      'The intermediate table transformation pivots the data on the z encoding'
    );

    assert.strictEqual(
      stack.data.length,
      3,
      'The stacked data contains a series for each category derived from the z encoding'
    );

    assert.deepEqual(
      stack.data[0],
      Object.assign(
        [
          { y0: 0, y1: 1, y: 1, x: 0, data: stack.table[0] },
          { y0: 0, y1: 2, y: 2, x: 1, data: stack.table[1] },
          { y0: 0, y1: 1, y: 1, x: 2, data: stack.table[2] },
          { y0: 0, y1: 2, y: 2, x: 3, data: stack.table[3] },
          { y0: 0, y1: 1, y: 1, x: 4, data: stack.table[4] },
          { y0: 0, y1: 2, y: 2, x: 5, data: stack.table[5] },
          { y0: 0, y1: 1, y: 1, x: 6, data: stack.table[6] },
          { y0: 0, y1: 2, y: 2, x: 7, data: stack.table[7] },
          { y0: 0, y1: 1, y: 1, x: 8, data: stack.table[8] },
          { y0: 0, y1: 2, y: 2, x: 9, data: stack.table[9] },
          { y0: 0, y1: 1, y: 1, x: 10, data: stack.table[10] },
          { y0: 0, y1: 2, y: 2, x: 11, data: stack.table[11] },
        ],
        { key: 'Sunday', index: 0 }
      ),
      'Each stack series has y0, y1, and x properties in addition to the full corresponding table record'
    );

    assert.deepEqual(
      stack.data[1],
      Object.assign(
        [
          { y0: 1, y1: 2, y: 2, x: 0, data: stack.table[0] },
          { y0: 2, y1: 4, y: 4, x: 1, data: stack.table[1] },
          { y0: 1, y1: 4, y: 4, x: 2, data: stack.table[2] },
          { y0: 2, y1: 6, y: 6, x: 3, data: stack.table[3] },
          { y0: 1, y1: 6, y: 6, x: 4, data: stack.table[4] },
          { y0: 2, y1: 8, y: 8, x: 5, data: stack.table[5] },
          { y0: 1, y1: 8, y: 8, x: 6, data: stack.table[6] },
          { y0: 2, y1: 10, y: 10, x: 7, data: stack.table[7] },
          { y0: 1, y1: 10, y: 10, x: 8, data: stack.table[8] },
          { y0: 2, y1: 12, y: 12, x: 9, data: stack.table[9] },
          { y0: 1, y1: 12, y: 12, x: 10, data: stack.table[10] },
          { y0: 2, y1: 14, y: 14, x: 11, data: stack.table[11] },
        ],
        { key: 'Monday', index: 1 }
      ),
      'Each series in a stack stacks on the previous series'
    );
  });

  test('When the direction is horizontal, series stack on x values', function (assert) {
    const stack = new Stack({
      data: TEST_DATA,
      direction: 'horizontal',
      x: 'value',
      y: 'hour',
      z: 'day',
    });

    assert.deepEqual(
      stack.table[0],
      {
        y: 0,
        Sunday: 1,
        Monday: 1,
        Tuesday: 5,
      },
      'The intermediate table transformation pivots the data on the z encoding'
    );

    assert.strictEqual(
      stack.data.length,
      3,
      'The stacked data contains a series for each category derived from the z encoding'
    );

    assert.deepEqual(
      stack.data[1],
      Object.assign(
        [
          { x0: 1, x1: 2, x: 2, y: 0, data: stack.table[0] },
          { x0: 2, x1: 4, x: 4, y: 1, data: stack.table[1] },
          { x0: 1, x1: 4, x: 4, y: 2, data: stack.table[2] },
          { x0: 2, x1: 6, x: 6, y: 3, data: stack.table[3] },
          { x0: 1, x1: 6, x: 6, y: 4, data: stack.table[4] },
          { x0: 2, x1: 8, x: 8, y: 5, data: stack.table[5] },
          { x0: 1, x1: 8, x: 8, y: 6, data: stack.table[6] },
          { x0: 2, x1: 10, x: 10, y: 7, data: stack.table[7] },
          { x0: 1, x1: 10, x: 10, y: 8, data: stack.table[8] },
          { x0: 2, x1: 12, x: 12, y: 9, data: stack.table[9] },
          { x0: 1, x1: 12, x: 12, y: 10, data: stack.table[10] },
          { x0: 2, x1: 14, x: 14, y: 11, data: stack.table[11] },
        ],
        { key: 'Monday', index: 1 }
      ),
      'Each series in a stack stacks on the previous series'
    );
  });

  test('The order property is passed to the D3 stack constructor', function (assert) {
    const stack = new Stack({
      data: TEST_DATA,
      order: 'descending',
      x: 'hour',
      y: 'value',
      z: 'day',
    });

    assert.deepEqual(
      stack.data[1],
      convert(
        d3Stack()
          .order(stackOrderDescending)
          .keys(['Sunday', 'Monday', 'Tuesday'])(stack.table)
          .sort(sortByIndex)
      )[1]
    );

    stack.order = stackOrderReverse;

    assert.deepEqual(
      stack.data[1],
      convert(
        d3Stack()
          .order(stackOrderReverse)
          .keys(['Sunday', 'Monday', 'Tuesday'])(stack.table)
          .sort(sortByIndex)
      )[1]
    );
  });

  test('The offset property is passed to the D3 stack constructor', function (assert) {
    const stack = new Stack({
      data: TEST_DATA,
      order: 'descending',
      offset: 'expand',
      x: 'hour',
      y: 'value',
      z: 'day',
    });

    assert.deepEqual(
      stack.data[1],
      convert(
        d3Stack()
          .order(stackOrderDescending)
          .offset(stackOffsetExpand)
          .keys(['Sunday', 'Monday', 'Tuesday'])(stack.table)
          .sort(sortByIndex)
      )[1]
    );

    stack.offset = stackOffsetSilhouette;

    assert.deepEqual(
      stack.data[1],
      convert(
        d3Stack()
          .order(stackOrderDescending)
          .offset(stackOffsetSilhouette)
          .keys(['Sunday', 'Monday', 'Tuesday'])(stack.table)
          .sort(sortByIndex)
      )[1]
    );
  });

  test('The defaults are direction=vertical, order=none, and offset=none', function (assert) {
    const stack = new Stack({
      data: TEST_DATA,
      x: 'hour',
      y: 'value',
      z: 'day',
    });

    assert.deepEqual(
      stack.data[1],
      convert(
        d3Stack()
          .order(stackOrderNone)
          .offset(stackOffsetNone)
          .keys(['Sunday', 'Monday', 'Tuesday'])(stack.table)
          .sort(sortByIndex)
      )[1]
    );
  });

  test('When the offset is wiggle, the default order is insideOut', function (assert) {
    const stack = new Stack({
      data: TEST_DATA,
      offset: 'wiggle',
      order: 'insideOut',
      x: 'hour',
      y: 'value',
      z: 'day',
    });

    assert.deepEqual(
      stack.data[1],
      convert(
        d3Stack()
          .offset(stackOffsetWiggle)
          .order(stackOrderInsideOut)
          .keys(['Sunday', 'Monday', 'Tuesday'])(stack.table)
          .sort(sortByIndex)
      )[1]
    );
  });

  test('When the data property is updated, the stack is recomputed but the order persists', function (assert) {
    const stack = new Stack({
      data: TEST_DATA,
      order: 'descending',
      x: 'hour',
      y: 'value',
      z: 'day',
    });

    assert.deepEqual(
      stack.data[1],
      convert(
        d3Stack()
          .order(stackOrderDescending)
          .keys(['Sunday', 'Monday', 'Tuesday'])(stack.table)
          .sort(sortByIndex)
      )[1]
    );

    stack.dataIn = [
      ...TEST_DATA,
      { day: 'Sunday', hour: 12, value: 100 }, // Increasing the value of Sunday makes it first in desc order
      { day: 'Monday', hour: 12, value: 5 },
      { day: 'Tuesday', hour: 12, value: 3 },
    ];

    assert.deepEqual(
      stack.data[1],
      convert(
        d3Stack()
          .keys(['Tuesday', 'Monday', 'Sunday'])(stack.table)
          .sort(sortByIndex)
      )[1]
    );
  });

  test('When stable=false, the is stack order is recomputed', function (assert) {
    const stack = new Stack({
      data: TEST_DATA,
      order: 'descending',
      x: 'hour',
      y: 'value',
      z: 'day',
      stable: false,
    });

    assert.deepEqual(
      stack.data[1],
      convert(
        d3Stack()
          .order(stackOrderDescending)
          .keys(['Sunday', 'Monday', 'Tuesday'])(stack.table)
          .sort(sortByIndex)
      )[1]
    );

    stack.dataIn = [
      ...TEST_DATA,
      { day: 'Sunday', hour: 12, value: 100 }, // Increasing the value of Sunday makes it first in desc order
      { day: 'Monday', hour: 12, value: 5 },
      { day: 'Tuesday', hour: 12, value: 3 },
    ];

    assert.deepEqual(
      stack.data[1],
      convert(
        d3Stack()
          .order(stackOrderDescending)
          .keys(['Sunday', 'Monday', 'Tuesday'])(stack.table)
          .sort(sortByIndex)
      )[1]
    );
  });

  test('Calling stack.stack on a slice of data stacks the slice using the order and offset of the full stack structure', function (assert) {});
});
