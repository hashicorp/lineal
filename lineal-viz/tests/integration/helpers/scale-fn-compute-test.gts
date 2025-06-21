/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { spy } from 'sinon';
import scaleLinear from '#src/helpers/scale-linear.ts';
import scaleFnCompute from '#src/helpers/scale-fn-compute.ts';
import spyHelper from '#tests/helpers/spy.ts';

module('Integration | helpers | scale-fn-compute', function (hooks) {
  setupRenderingTest(hooks);

  test('scale-fn-compute computes a value using the provided scale', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let (scaleLinear domain="0..100" range="0..500") as |scale|}}
          {{spyHelper spyFn (scaleFnCompute scale 50)}}
        {{/let}}
      </template>,
    );

    const computedValue = spyFn.getCall(0).args[0];
    assert.strictEqual(
      computedValue,
      250,
      'correctly computes the scaled value',
    );
  });

  test('scale-fn-compute works with different input values', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let (scaleLinear domain="0..100" range="0..500") as |scale|}}
          {{spyHelper spyFn (scaleFnCompute scale 0)}}
          {{spyHelper spyFn (scaleFnCompute scale 100)}}
          {{spyHelper spyFn (scaleFnCompute scale 25)}}
        {{/let}}
      </template>,
    );

    assert.strictEqual(
      spyFn.getCall(0).args[0],
      0,
      'computes 0 for min domain value',
    );
    assert.strictEqual(
      spyFn.getCall(1).args[0],
      500,
      'computes 500 for max domain value',
    );
    assert.strictEqual(
      spyFn.getCall(2).args[0],
      125,
      'computes 125 for 25% domain value',
    );
  });
});
