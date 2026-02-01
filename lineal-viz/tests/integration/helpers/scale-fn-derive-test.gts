/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hash } from '@ember/helper';
import { spy } from 'sinon';
import scaleLinear from '#src/helpers/scale-linear.ts';
import scaleFnDerive from '#src/helpers/scale-fn-derive.ts';
import scaleFnCompute from '#src/helpers/scale-fn-compute.ts';
import spyHelper from '#tests/helpers/spy.ts';

module('Integration | helpers | scale-fn-derive', function (hooks) {
  setupRenderingTest(hooks);

  test('scale-fn-derive creates a new scale with overridden config', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let (scaleLinear domain="0..100" range="0..500") as |scale|}}
          {{#let
            (scaleFnDerive scale (hash range="0..1000"))
            as |derivedScale|
          }}
            {{spyHelper spyFn (scaleFnCompute derivedScale 50)}}
          {{/let}}
        {{/let}}
      </template>,
    );

    const computedValue = spyFn.getCall(0).args[0];
    assert.strictEqual(
      computedValue,
      500,
      'derived scale uses new range (0..1000)',
    );
  });

  test('scale-fn-derive preserves original scale domain when not overridden', async function (assert) {
    const originalSpyFn = spy();
    const derivedSpyFn = spy();

    await render(
      <template>
        {{#let (scaleLinear domain="0..100" range="0..500") as |scale|}}
          {{spyHelper originalSpyFn (scaleFnCompute scale 50)}}
          {{#let
            (scaleFnDerive scale (hash range="0..1000"))
            as |derivedScale|
          }}
            {{spyHelper derivedSpyFn (scaleFnCompute derivedScale 50)}}
          {{/let}}
        {{/let}}
      </template>,
    );

    assert.strictEqual(
      originalSpyFn.getCall(0).args[0],
      250,
      'original scale unchanged',
    );
    assert.strictEqual(
      derivedSpyFn.getCall(0).args[0],
      500,
      'derived scale uses new range',
    );
  });
});
