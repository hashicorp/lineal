import { module, test } from 'qunit';
import * as Scale from 'lineal-viz/scale';

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
