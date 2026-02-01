/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { spy } from 'sinon';
import scaleLinear from '#src/helpers/scale-linear.ts';
import { ScaleLinear } from '#src/scale.ts';
import spyHelper from '#tests/helpers/spy.ts';

module('Integration | helpers | scale-linear', function (hooks) {
  setupRenderingTest(hooks);

  test('scale-linear creates a ScaleLinear instance', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let (scaleLinear domain="0..100" range="0..500") as |scale|}}
          {{spyHelper spyFn scale}}
        {{/let}}
      </template>,
    );

    const scale = spyFn.getCall(0).args[0];
    assert.ok(scale instanceof ScaleLinear, 'creates a ScaleLinear instance');
  });

  test('scale-linear computes values correctly', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let (scaleLinear domain="0..100" range="0..500") as |scale|}}
          {{spyHelper spyFn scale}}
        {{/let}}
      </template>,
    );

    const scale = spyFn.getCall(0).args[0] as ScaleLinear;
    assert.strictEqual(scale.compute(0), 0, 'computes min correctly');
    assert.strictEqual(scale.compute(50), 250, 'computes mid correctly');
    assert.strictEqual(scale.compute(100), 500, 'computes max correctly');
  });
});
