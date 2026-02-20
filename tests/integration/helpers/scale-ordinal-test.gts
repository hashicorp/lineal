/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { array } from '@ember/helper';
import { spy } from 'sinon';
import scaleOrdinal from '#src/helpers/scale-ordinal.ts';
import { ScaleOrdinal } from '#src/utils/scale.ts';
import spyHelper from '#tests/helpers/spy.ts';

module('Integration | helpers | scale-ordinal', function (hooks) {
  setupRenderingTest(hooks);

  test('scale-ordinal creates a ScaleOrdinal instance', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let
          (scaleOrdinal
            domain=(array "a" "b" "c") range=(array "red" "green" "blue")
          )
          as |scale|
        }}
          {{spyHelper spyFn scale}}
        {{/let}}
      </template>,
    );

    const scale = spyFn.getCall(0).args[0];
    assert.ok(scale instanceof ScaleOrdinal, 'creates a ScaleOrdinal instance');
  });

  test('scale-ordinal maps domain values to range values', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let
          (scaleOrdinal
            domain=(array "a" "b" "c") range=(array "red" "green" "blue")
          )
          as |scale|
        }}
          {{spyHelper spyFn scale}}
        {{/let}}
      </template>,
    );

    const scale = spyFn.getCall(0).args[0] as ScaleOrdinal;
    assert.strictEqual(scale.compute('a'), 'red', 'maps a to red');
    assert.strictEqual(scale.compute('b'), 'green', 'maps b to green');
    assert.strictEqual(scale.compute('c'), 'blue', 'maps c to blue');
  });
});
