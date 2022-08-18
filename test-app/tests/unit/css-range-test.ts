import { module, test } from 'qunit';
import CSSRange from 'lineal-viz/css-range';

module('Unit | CSSRange', function () {
  test('CSSRanges are constructed with a string prefix', function (assert) {
    const range = new CSSRange('foo');
    assert.strictEqual(range.name, 'foo');
  });

  test('The spread method returns an array of strings with a length equal to the provided count', function (assert) {
    const range = new CSSRange('foo');
    assert.strictEqual(range.spread(10).length, 10);
  });

  test('The strings returned from the spread method includes the prefix, the number, and number in series', function (assert) {
    const range = new CSSRange('foo');
    assert.deepEqual(range.spread(3), [
      'foo foo-1 foo-3-1',
      'foo foo-2 foo-3-2',
      'foo foo-3 foo-3-3',
    ]);
  });
});