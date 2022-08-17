import { module, test } from 'qunit';
import { ScaleLinear, ScaleUtc } from 'lineal-viz/scale';
import Bounds from 'lineal-viz/bounds';

const NOW = Date.now();
const DAY = 1000 * 60 * 60 * 24;

module('Unit | ScaleLinear', function () {
  test('the compute method performs the scale operation', function (assert) {
    const scale = new ScaleLinear({
      domain: [0, 20],
      range: [100, 500],
    });

    assert.strictEqual(scale.compute(0), 100);
    assert.strictEqual(scale.compute(10), 300);
    assert.strictEqual(scale.compute(15), 400);
    assert.strictEqual(scale.compute(20), 500);

    // Default d3-scale behavior: ranges will extrapolate the domain
    assert.strictEqual(scale.compute(25), 600);
  });

  test('can be constructed with no arguments', function (assert) {
    const scale = new ScaleLinear();
    assert.ok(scale.domain instanceof Bounds);
    assert.ok(scale.range instanceof Bounds);

    const domainBounds = scale.domain as Bounds<number>;
    const rangeBounds = scale.range as Bounds<number>;

    assert.strictEqual(domainBounds.min, undefined);
    assert.strictEqual(domainBounds.max, undefined);
    assert.strictEqual(rangeBounds.min, undefined);
    assert.strictEqual(rangeBounds.max, undefined);
  });

  test('can be constructed with a domain and a range', function (assert) {
    const scale = new ScaleLinear({ range: [0, 50], domain: [0, 10, 100] });
    assert.deepEqual(scale.scaleArgs, [
      [0, 10, 100],
      [0, 50],
    ]);
  });

  test('domains and ranges can use Bounds syntax', function (assert) {
    const data = [1, 10, 50, 1, 3, 25, 12, 999, 5];
    const scale = new ScaleLinear({ range: '10..100', domain: '0..' });
    (scale.domain as Bounds<number>).qualify(data, (d: number) => d);

    assert.deepEqual(scale.scaleArgs, [
      [0, 999],
      [10, 100],
    ]);
  });

  test('when the domain or range are invalid, an error is thrown when calling compute', function (assert) {
    const scale = new ScaleLinear({ range: '10..100', domain: '0..' });
    assert.throws(() => {
      scale.compute(50);
    }, /not been qualified/);
  });

  test('the computed d3 scale can be accessed at scale#d3scale', function (assert) {
    const scale = new ScaleLinear({ range: '10..100', domain: '1..10' });
    assert.notOk(scale.d3Scale.clamp());
    assert.strictEqual(scale.compute(11), 110);

    scale.clamp = true;
    assert.ok(scale.d3Scale.clamp());
    assert.strictEqual(scale.compute(11), 100);
  });
});

module('Unit | ScaleUtc', function () {
  test('the compute method performs the scale operation', function (assert) {
    const scale = new ScaleUtc({
      domain: [new Date(NOW), new Date(NOW - 10 * DAY)],
      range: [100, 500],
    });

    assert.strictEqual(scale.compute(new Date(NOW)), 100);
    assert.strictEqual(scale.compute(new Date(NOW - 5 * DAY)), 300);
    assert.strictEqual(scale.compute(new Date(NOW - 7.5 * DAY)), 400);
    assert.strictEqual(scale.compute(new Date(NOW - 10 * DAY)), 500);

    // Default d3-scale behavior: ranges will extrapolate the domain
    assert.strictEqual(scale.compute(new Date(NOW - 15 * DAY)), 700);
  });

  test('can be constructed with no arguments', function (assert) {
    const scale = new ScaleUtc();
    assert.ok(scale.domain instanceof Bounds);
    assert.ok(scale.range instanceof Bounds);

    const domainBounds = scale.domain as Bounds<Date>;
    const rangeBounds = scale.range as Bounds<number>;

    assert.strictEqual(domainBounds.min, undefined);
    assert.strictEqual(domainBounds.max, undefined);
    assert.strictEqual(rangeBounds.min, undefined);
    assert.strictEqual(rangeBounds.max, undefined);
  });

  test('ranges can use Bounds syntax', function (assert) {
    const data = [1, 10, 50, 1, 3, 25, 12, 999, 5];
    const scale = new ScaleUtc({
      range: '..',
      domain: [new Date(NOW), new Date(NOW - DAY)],
    });
    (scale.range as Bounds<number>).qualify(data, (d: number) => d);

    assert.deepEqual(scale.scaleArgs, [
      [new Date(NOW), new Date(NOW - DAY)],
      [1, 999],
    ]);
  });

  test('unspecified domains become Bounds and can be qualified with a dataset', function (assert) {
    const data = [1, 2, 3, 4, 5].map((n) => new Date(NOW - n * DAY));
    const scale = new ScaleUtc({ range: '0..100' });
    (scale.domain as Bounds<Date>).qualify(data, (d: Date) => d);

    assert.deepEqual(scale.scaleArgs, [
      [new Date(NOW - 5 * DAY), new Date(NOW - DAY)],
      [0, 100],
    ]);
  });

  test('when the domain or range are invalid, an error is thrown when calling compute', function (assert) {
    const scale = new ScaleUtc();
    assert.throws(() => {
      scale.compute(new Date());
    }, /not been qualified/);
  });

  test('the computed d3 scale can be accessed at scale#d3scale', function (assert) {
    const scale = new ScaleUtc({
      range: '0..10',
      domain: [new Date(NOW - DAY), new Date(NOW)],
    });
    assert.notOk(scale.d3Scale.clamp());
    assert.strictEqual(scale.compute(new Date(NOW + DAY)), 20);

    scale.clamp = true;
    assert.ok(scale.d3Scale.clamp());
    assert.strictEqual(scale.compute(new Date(NOW + DAY)), 10);
  });
});
