import { module, test } from 'qunit';
import { ScaleLinear } from 'lineal-viz/scale';
import Bounds from 'lineal-viz/bounds';

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
