/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { spy } from 'sinon';
import scaleLog from '#src/helpers/scale-log.ts';
import { ScaleLog } from '#src/scale.ts';
import spyHelper from '#tests/helpers/spy.ts';

module('Integration | helpers | scale-log', function (hooks) {
  setupRenderingTest(hooks);

  test('scale-log creates a ScaleLog instance', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let (scaleLog domain="1..1000" range="0..300") as |scale|}}
          {{spyHelper spyFn scale}}
        {{/let}}
      </template>,
    );

    const scale = spyFn.getCall(0).args[0];
    assert.ok(scale instanceof ScaleLog, 'creates a ScaleLog instance');
  });

  test('scale-log computes logarithmic values', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let (scaleLog domain="1..1000" range="0..300") as |scale|}}
          {{spyHelper spyFn scale}}
        {{/let}}
      </template>,
    );

    const scale = spyFn.getCall(0).args[0] as ScaleLog;
    assert.strictEqual(scale.compute(1), 0, 'computes 1 to 0');
    assert.strictEqual(scale.compute(1000), 300, 'computes 1000 to 300');
    // log10(10) / log10(1000) = 1/3, so 10 should map to ~100
    assert.ok(
      Math.abs(scale.compute(10) - 100) < 0.0001,
      'computes 10 to approximately 100 (logarithmic)',
    );
  });
});
