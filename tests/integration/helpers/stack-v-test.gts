/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { array } from '@ember/helper';
import { spy } from 'sinon';
import stackV from '#src/helpers/stack-v.ts';
import spyHelper from '#tests/helpers/spy.ts';

module('Integration | helpers | stack-v', function (hooks) {
  setupRenderingTest(hooks);

  test('stack-h creates a stack with a vertical direction', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let (stackV x="foo" y="bar" z="baz" data=(array)) as |stack|}}
          {{spyHelper spyFn stack}}
        {{/let}}
      </template>,
    );

    const stack = spyFn.getCall(0).args[0];
    assert.strictEqual(stack.direction, 'vertical');
  });

  test('stack-h will have a vertical direction, even when a horizontal direction is specified', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let
          (stackV x="foo" y="bar" z="baz" data=(array) direction="horizontal")
          as |stack|
        }}
          {{spyHelper spyFn stack}}
        {{/let}}
      </template>,
    );

    const stack = spyFn.getCall(0).args[0];
    assert.strictEqual(stack.direction, 'vertical');
  });
});
