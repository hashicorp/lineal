/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { array } from '@ember/helper';
import { spy } from 'sinon';
import scaleBand from '#src/helpers/scale-band.ts';
import { ScaleBand } from '#src/utils/scale.ts';
import spyHelper from '#tests/helpers/spy.ts';

module('Integration | helpers | scale-band', function (hooks) {
  setupRenderingTest(hooks);

  test('scale-band creates a ScaleBand instance', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let
          (scaleBand domain=(array "a" "b" "c") range="0..300")
          as |scale|
        }}
          {{spyHelper spyFn scale}}
        {{/let}}
      </template>,
    );

    const scale = spyFn.getCall(0).args[0];
    assert.ok(scale instanceof ScaleBand, 'creates a ScaleBand instance');
  });

  test('scale-band computes band positions', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let
          (scaleBand domain=(array "a" "b" "c") range="0..300")
          as |scale|
        }}
          {{spyHelper spyFn scale}}
        {{/let}}
      </template>,
    );

    const scale = spyFn.getCall(0).args[0] as ScaleBand;
    assert.strictEqual(scale.compute('a'), 0, 'first band starts at 0');
    assert.strictEqual(scale.compute('b'), 100, 'second band starts at 100');
    assert.strictEqual(scale.compute('c'), 200, 'third band starts at 200');
    assert.strictEqual(scale.bandwidth, 100, 'bandwidth is 100');
  });

  test('scale-band respects padding configuration', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let
          (scaleBand domain=(array "a" "b" "c") range="0..300" padding=0.5)
          as |scale|
        }}
          {{spyHelper spyFn scale}}
        {{/let}}
      </template>,
    );

    const scale = spyFn.getCall(0).args[0] as ScaleBand;
    assert.ok(scale.bandwidth < 100, 'bandwidth is reduced due to padding');
    assert.ok(scale.step > scale.bandwidth, 'step is greater than bandwidth');
  });
});
