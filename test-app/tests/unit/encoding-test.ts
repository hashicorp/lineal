import { module, test } from 'qunit';
import { Encoding } from 'lineal-viz/encoding';

module('Unit | Encoding', function () {
  test('The accessor may be a function', function (assert) {
    const encode = new Encoding((d: { x: number }) => d.x * 2);
    assert.strictEqual(encode.field, undefined);
    assert.strictEqual(encode.accessor({ x: 5 }), 10);
  });

  test('The accessor may be a string', function (assert) {
    const encode = new Encoding('field');
    assert.strictEqual(encode.field, 'field');

    const datum = { field: 'corn', road: 'gravel' };
    assert.strictEqual(encode.accessor(datum), 'corn');
  });
});
