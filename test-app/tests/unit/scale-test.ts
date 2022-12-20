import { module, test } from 'qunit';
import {
  ScaleLinear,
  ScaleUtc,
  ScaleDiverging,
  ScaleOrdinal,
  ScaleBand,
} from '@lineal-viz/lineal/scale';
import Bounds from '@lineal-viz/lineal/bounds';
import CSSRange from '@lineal-viz/lineal/css-range';

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

  test('the computed d3 scale can be accessed at scale#d3Scale', function (assert) {
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

module('Unit | ScaleDiverging', function () {
  test('A diverging scale must be constructed with a domain and a range', function (assert) {
    // Maps an input value (0-1, the d3 interpolate inerface) to an emoticon
    const interpolateEmoticon = (n: number) => {
      const emoticons = ['>:U', '>:(', ':(', ':|', ':)', ':D', 'XD'];
      return emoticons[Math.floor(n * (emoticons.length - 1))];
    };

    const scale = new ScaleDiverging<string>({
      domain: [-10, 0, 10],
      range: interpolateEmoticon,
    });

    assert.strictEqual(scale.compute(-10), '>:U');
    assert.strictEqual(scale.compute(0), ':|');
    assert.strictEqual(scale.compute(10), 'XD');

    // Domains can be updated, recomputing the scale
    scale.domain = [-10, 0, 100];

    // Diverging scales are like two linear scales, one on each
    // side of the middle value.
    assert.strictEqual(scale.compute(34), ':)');
    assert.strictEqual(scale.compute(68), ':D');
    assert.strictEqual(scale.compute(-4), '>:(');
  });

  test('the computed d3 scale can be accessed at scale#d3Scale', function (assert) {
    const scale = new ScaleDiverging<number>({
      domain: [0, 0.5, 1],
      range: (n: number) => n,
    });
    assert.notOk(scale.d3Scale.clamp());
    assert.strictEqual(scale.compute(2), 2);

    scale.clamp = true;
    assert.ok(scale.d3Scale.clamp());
    assert.strictEqual(scale.compute(2), 1);
  });
});

module('Unit | ScaleOrdinal', function () {
  test('the compute method performs the scale operation', function (assert) {
    const scale = new ScaleOrdinal({
      domain: ['one', 'two', 'red', 'blue'],
      range: ['A', 'B', 'C', 'D'],
    });

    assert.strictEqual(scale.compute('one'), 'A');
    assert.strictEqual(scale.compute('two'), 'B');
    assert.strictEqual(scale.compute('red'), 'C');
    assert.strictEqual(scale.compute('blue'), 'D');
  });

  test('the range can be specified as a CSSRange', function (assert) {
    const scale = new ScaleOrdinal({
      domain: ['one', 'two', 'red', 'blue'],
      range: new CSSRange('fish'),
    });

    assert.strictEqual(scale.compute('one'), 'fish fish-1 fish-4-1');
    assert.strictEqual(scale.compute('two'), 'fish fish-2 fish-4-2');
    assert.strictEqual(scale.compute('red'), 'fish fish-3 fish-4-3');
    assert.strictEqual(scale.compute('blue'), 'fish fish-4 fish-4-4');
  });

  test('the range property carries the CSSRange type for conditional usage', function (assert) {
    const scale = new ScaleOrdinal({
      domain: ['one', 'two', 'red', 'blue'],
      range: new CSSRange('fish'),
    });

    assert.ok(scale.range instanceof CSSRange);
  });

  test('the computed d3 scale can be accessed at scale#d3Scale', function (assert) {
    const scale = new ScaleOrdinal({
      domain: ['one', 'two', 'red', 'blue'],
      range: ['A', 'B', 'C', 'D'],
    });

    assert.strictEqual(scale.d3Scale('one'), 'A');
  });
});

module('Unit | ScaleBand', function () {
  test('the compute method performas the scale operation', function (assert) {
    const scale = new ScaleBand({
      domain: ['one', 'two', 'red', 'blue'],
      range: [0, 100],
    });

    assert.strictEqual(scale.compute('one'), 0);
    assert.strictEqual(scale.compute('two'), (100 / 8) * 2);
    assert.strictEqual(scale.compute('red'), (100 / 8) * 4);
    assert.strictEqual(scale.compute('blue'), (100 / 8) * 6);
  });

  test('the range can be specified as a Bounds notation string', function (assert) {
    const scale = new ScaleBand({
      domain: ['one', 'two', 'red', 'blue'],
      range: '100..250',
    });

    assert.strictEqual(scale.compute('one'), 100);
    assert.strictEqual(scale.compute('two'), (150 / 8) * 2 + 100);
    assert.strictEqual(scale.compute('red'), (150 / 8) * 4 + 100);
    assert.strictEqual(scale.compute('blue'), (150 / 8) * 6 + 100);
  });

  test('the computed d3 scale can be accessed at scale#d3Scale', function (assert) {
    const scale = new ScaleBand({
      domain: ['one', 'two', 'red', 'blue'],
      range: [0, 100],
    });

    assert.strictEqual(scale.d3Scale('one'), 0);
    assert.strictEqual(scale.d3Scale.step(), 100 / 4);
  });

  test('the paddingInner and paddingOuter settings override the padding setting', function (assert) {
    const scale1 = new ScaleBand({
      domain: ['one', 'two', 'red', 'blue'],
      range: [0, 100],
      padding: 10,
      paddingInner: 5,
    });

    assert.strictEqual(scale1.paddingInner, 5);
    assert.strictEqual(scale1.paddingOuter, 10);

    const scale2 = new ScaleBand({
      domain: ['one', 'two', 'red', 'blue'],
      range: [0, 100],
      padding: 10,
      paddingOuter: 5,
    });

    assert.strictEqual(scale2.paddingInner, 10);
    assert.strictEqual(scale2.paddingOuter, 5);

    const scale3 = new ScaleBand({
      domain: ['one', 'two', 'red', 'blue'],
      range: [0, 100],
      padding: 10,
    });

    assert.strictEqual(scale3.paddingInner, 10);
    assert.strictEqual(scale3.paddingOuter, 10);

    const scale4 = new ScaleBand({
      domain: ['one', 'two', 'red', 'blue'],
      range: [0, 100],
      padding: 10,
      paddingInner: 20,
      paddingOuter: 30,
    });

    assert.strictEqual(scale4.paddingInner, 20);
    assert.strictEqual(scale4.paddingOuter, 30);
  });

  test('the align setting is passed into the d3Scale constructor', function (assert) {
    const scale = new ScaleBand({
      domain: ['one', 'two', 'red', 'blue'],
      range: [0, 100],
      paddingOuter: 0.5,
    });

    assert.strictEqual(scale.compute('one'), scale.step * 0.5);

    scale.align = 0;
    assert.strictEqual(scale.compute('one'), scale.step * 0);

    scale.align = 1;
    assert.strictEqual(scale.compute('one'), scale.step * 1);

    scale.align = 1 / 3;
    assert.strictEqual(scale.compute('one'), scale.step * (1 / 3));
  });

  test('the bandwidth getter returns the bandwidth computed by the d3 band scale', function (assert) {
    const scale = new ScaleBand({
      domain: ['one', 'two', 'red', 'blue'],
      range: [0, 100],
      padding: 10,
    });

    assert.strictEqual(scale.bandwidth, scale.d3Scale.bandwidth());
  });

  test('the step getter returns the step computed by the d3 band scale', function (assert) {
    const scale = new ScaleBand({
      domain: ['one', 'two', 'red', 'blue'],
      range: [0, 100],
      padding: 10,
    });

    assert.strictEqual(scale.step, scale.d3Scale.step());
  });
});
