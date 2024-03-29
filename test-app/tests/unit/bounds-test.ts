/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import Bounds from '@lineal-viz/lineal/bounds';
import tableTest from '../utils/table-test';

module('Unit | Bounds', function () {
  const TEST_DATA = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 2 },
    { x: 4, y: 3 },
    { x: 5, y: 5 },
    { x: 6, y: 8 },
    { x: 7, y: 13 },
  ];

  test('Both min and max are optional', function (assert) {
    const bounds = new Bounds();
    assert.strictEqual(bounds.min, undefined);
    assert.strictEqual(bounds.max, undefined);
  });

  test('When either min or max are undefined, the bounds are invalid', function (assert) {
    const noBounds = new Bounds();
    const noMin = new Bounds(undefined, 10);
    const noMax = new Bounds(10);

    assert.notOk(noBounds.isValid);
    assert.notOk(noMin.isValid);
    assert.notOk(noMax.isValid);
  });

  test('when min is undefined, qualify derives the min from a dataset', function (assert) {
    const scale = new Bounds(undefined, 5);
    assert.strictEqual(scale.min, undefined);
    assert.strictEqual(scale.max, 5);

    scale.qualify(TEST_DATA, 'x');
    assert.strictEqual(scale.min, Math.min(...TEST_DATA.map((d) => d.x)));
    assert.strictEqual(scale.max, 5);
  });

  test('when max is undefined, qualify derives the max from a dataset', function (assert) {
    const scale = new Bounds(2);
    assert.strictEqual(scale.min, 2);
    assert.strictEqual(scale.max, undefined);

    scale.qualify(TEST_DATA, 'x');
    assert.strictEqual(scale.min, 2);
    assert.strictEqual(scale.max, Math.max(...TEST_DATA.map((d) => d.x)));
  });

  test('qualify accepts a dataset and a field accessor as a string', function (assert) {
    const scaleX = new Bounds().qualify(TEST_DATA, 'x');
    assert.strictEqual(scaleX.min, Math.min(...TEST_DATA.map((d) => d.x)));
    assert.strictEqual(scaleX.max, Math.max(...TEST_DATA.map((d) => d.x)));

    const scaleY = new Bounds().qualify(TEST_DATA, 'y');
    assert.strictEqual(scaleY.min, Math.min(...TEST_DATA.map((d) => d.y)));
    assert.strictEqual(scaleY.max, Math.max(...TEST_DATA.map((d) => d.y)));
  });

  test('once a Bounds has a min and a max, qualify is a no-op', function (assert) {
    const scaleX = new Bounds().qualify(TEST_DATA, 'x');
    const [MIN, MAX] = [
      Math.min(...TEST_DATA.map((d) => d.x)),
      Math.max(...TEST_DATA.map((d) => d.x)),
    ];
    assert.strictEqual(scaleX.min, MIN);
    assert.strictEqual(scaleX.max, MAX);

    // Attempt to requalify using 'y'
    scaleX.qualify(TEST_DATA, 'y');
    assert.strictEqual(scaleX.min, MIN);
    assert.strictEqual(scaleX.max, MAX);

    // Attempt to requalify using 'x' with a different dataset
    scaleX.qualify([{ x: 1000, y: 5 }], 'x');
    assert.strictEqual(scaleX.min, MIN);
    assert.strictEqual(scaleX.max, MAX);
  });

  test('qualify throws an error when a field accessor cannot be used to compute an extent', function (assert) {
    const scale = new Bounds();

    assert.throws(() => scale.qualify(TEST_DATA, 'foo'), /Is "foo" defined/);
  });

  test('qualify accepts a dataset and a function accessor', function (assert) {
    const scale = new Bounds().qualify(
      TEST_DATA,
      (d: { x: number; y: number }) => d.x * 2
    );
    assert.strictEqual(scale.min, Math.min(...TEST_DATA.map((d) => d.x * 2)));
    assert.strictEqual(scale.max, Math.max(...TEST_DATA.map((d) => d.x * 2)));
  });

  test('attempting to access the scale bounds when min or max is undefined throws a useful error', function (assert) {
    const scale = new Bounds(10);
    assert.throws(() => {
      scale.bounds;
    }, /not been qualified/);
  });

  test('copy returns a new Bounds instance with identical properties', function (assert) {
    const bounds = new Bounds(0, 100);
    const unqualifiedBounds = Bounds.parse('10..');
    const piecewiseBounds = new Bounds<number>([0, 20, 80, 1000]);

    assert.deepEqual(bounds.bounds, bounds.copy().bounds);
    assert.deepEqual(unqualifiedBounds.min, unqualifiedBounds.copy().min);
    assert.deepEqual(unqualifiedBounds.max, unqualifiedBounds.copy().max);
    assert.deepEqual(piecewiseBounds.bounds, piecewiseBounds.copy().bounds);
  });
});

module('Unit | Bounds.parse', function () {
  tableTest<string | number[], Bounds<number>>(
    [
      {
        name: '".." has no min or max',
        input: '..',
        output: new Bounds(),
      },
      {
        name: '"0..0" has 0 as both min and max',
        input: '0..0',
        output: new Bounds(0, 0),
      },
      {
        name: '"10..1000" has 10 as min and 1000 as max',
        input: '10..1000',
        output: new Bounds(10, 1000),
      },
      { name: '"asdf" is bad input and throws', input: 'asdf', output: null },
      { name: '"0.f10" is bad input and throws', input: '0.f10', output: null },
      {
        name: 'when provided with a two element array, it is interpreted as [min, max]',
        input: [5, 15],
        output: new Bounds(5, 15),
      },
      {
        name: 'when provided with an array with more than two elements, a piecewise Bounds is returned',
        input: [5, 10, 15],
        output: new Bounds<number>([5, 10, 15]),
      },
      {
        name: 'when provided with an array with one element, a bounds with equal min and max is returend',
        input: [5],
        output: new Bounds(5, 5),
      },
      {
        name: 'when provided with an array with zero elements, a bounds with undefiend min and max is returend',
        input: [],
        output: new Bounds(),
      },
      {
        name: '"0.5..10.2" respects decimals and has 0.5 as min and 10.2 as max',
        input: '0.5..10.2',
        output: new Bounds(0.5, 10.2),
      },
      {
        name: '"1.3.5..10.9" is bad input and throws',
        input: '1.3.5..10.9',
        output: null,
      },
      {
        name: '"-3.14..3.14" respects the negative sign',
        input: '-3.14..3.14',
        output: new Bounds(-3.14, 3.14),
      },
      {
        name: '"3.14..-3.14" respects the negative sign',
        input: '3.14..-3.14',
        output: new Bounds(3.14, -3.14),
      },
    ],
    1,
    function (t, assert) {
      if (t.output === null) {
        assert.throws(() => {
          Bounds.parse(t.input);
        });
      } else if (t.output) {
        const { min, max } = Bounds.parse(t.input) as Bounds<number>;
        assert.deepEqual(
          { min, max },
          { min: t.output.min, max: t.output.max }
        );
      }
    }
  );
});
