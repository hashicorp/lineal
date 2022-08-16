import { module, test } from 'qunit';
import * as Scale from 'lineal-viz/scale';

interface TableTest {
  name: string;
  input: any;
  output?: any;
}

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
    const bounds = new Scale.Bounds();
    assert.strictEqual(bounds.min, undefined);
    assert.strictEqual(bounds.max, undefined);
  });

  test('When either min or max are undefined, the bounds are invalid', function (assert) {
    const noBounds = new Scale.Bounds();
    const noMin = new Scale.Bounds(undefined, 10);
    const noMax = new Scale.Bounds(10);

    assert.notOk(noBounds.isValid);
    assert.notOk(noMin.isValid);
    assert.notOk(noMax.isValid);
  });

  test('when min is undefined, qualify derives the min from a dataset', function (assert) {
    const scale = new Scale.Bounds(undefined, 5);
    assert.strictEqual(scale.min, undefined);
    assert.strictEqual(scale.max, 5);

    scale.qualify(TEST_DATA, 'x');
    assert.strictEqual(scale.min, Math.min(...TEST_DATA.map((d) => d.x)));
    assert.strictEqual(scale.max, 5);
  });

  test('when max is undefined, qualify derives the max from a dataset', function (assert) {
    const scale = new Scale.Bounds(2);
    assert.strictEqual(scale.min, 2);
    assert.strictEqual(scale.max, undefined);

    scale.qualify(TEST_DATA, 'x');
    assert.strictEqual(scale.min, 2);
    assert.strictEqual(scale.max, Math.max(...TEST_DATA.map((d) => d.x)));
  });

  test('qualify accepts a dataset and a field accessor as a string', function (assert) {
    const scaleX = new Scale.Bounds().qualify(TEST_DATA, 'x');
    assert.strictEqual(scaleX.min, Math.min(...TEST_DATA.map((d) => d.x)));
    assert.strictEqual(scaleX.max, Math.max(...TEST_DATA.map((d) => d.x)));

    const scaleY = new Scale.Bounds().qualify(TEST_DATA, 'y');
    assert.strictEqual(scaleY.min, Math.min(...TEST_DATA.map((d) => d.y)));
    assert.strictEqual(scaleY.max, Math.max(...TEST_DATA.map((d) => d.y)));
  });

  test('once a Bounds has a min and a max, qualify is a no-op', function (assert) {
    const scaleX = new Scale.Bounds().qualify(TEST_DATA, 'x');
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
    const scale = new Scale.Bounds();

    assert.throws(() => scale.qualify(TEST_DATA, 'foo'), /Is "foo" defined/);
  });

  test('qualify accepts a dataset and a function accessor', function (assert) {
    const scale = new Scale.Bounds().qualify(
      TEST_DATA,
      (d: { x: number; y: number }) => d.x * 2
    );
    assert.strictEqual(scale.min, Math.min(...TEST_DATA.map((d) => d.x * 2)));
    assert.strictEqual(scale.max, Math.max(...TEST_DATA.map((d) => d.x * 2)));
  });
});

module('Unit | parse', function () {
  tableTest(
    [
      {
        name: '".." has no min or max',
        input: '..',
        output: new Scale.Bounds(),
      },
      {
        name: '"0..0" has 0 as both min and max',
        input: '0..0',
        output: new Scale.Bounds(0, 0),
      },
      {
        name: '"10..1000" has 10 as min and 1000 as max',
        input: '10..1000',
        output: new Scale.Bounds(10, 1000),
      },
      { name: '"asdf" is bad input and throws', input: 'asdf', output: null },
      {
        name: 'when provided with an array, the same array is returned',
        input: [5, 10, 15],
      },
    ],
    1,
    function (t, assert) {
      if (t.output === null) {
        assert.throws(() => {
          Scale.parse(t.input);
        });
      } else if (t.output instanceof Scale.Bounds) {
        const { min, max } = Scale.parse(t.input) as Scale.Bounds;
        assert.deepEqual(
          { min, max },
          { min: t.output.min, max: t.output.max }
        );
      } else {
        assert.strictEqual(Scale.parse(t.input), t.input);
      }
    }
  );
});

module('Unit | Scale', function () {
  test('does the thing', function (assert) {
    const scale = new Scale.ScaleLinear({
      domain: [0, 20],
      range: [100, 500],
    });
    assert.ok(true);
    assert.strictEqual(scale.compute(10), 300);
  });
});

function tableTest(
  input: TableTest[],
  count: number,
  fn: (t: TableTest, assert: Assert) => void
) {
  for (const t of input) {
    test(t.name, function (assert) {
      assert.expect(count);
      fn(t, assert);
    });
  }
}
