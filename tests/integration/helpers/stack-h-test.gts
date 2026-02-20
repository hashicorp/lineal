/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { array } from '@ember/helper';
import { spy } from 'sinon';
import stackH from '#src/helpers/stack-h.ts';
import spyHelper from '#tests/helpers/spy.ts';

module('Integration | helpers | stack-h', function (hooks) {
  setupRenderingTest(hooks);

  test('stack-h creates a stack with a horizontal direction', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let (stackH x="foo" y="bar" z="baz" data=(array)) as |stack|}}
          {{spyHelper spyFn stack}}
        {{/let}}
      </template>,
    );

    const stack = spyFn.getCall(0).args[0];
    assert.strictEqual(stack.direction, 'horizontal');
  });

  test('stack-h will have a horizontal direction, even when a vertical direction is specified', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let
          (stackH x="foo" y="bar" z="baz" data=(array) direction="vertical")
          as |stack|
        }}
          {{spyHelper spyFn stack}}
        {{/let}}
      </template>,
    );

    const stack = spyFn.getCall(0).args[0];
    assert.strictEqual(stack.direction, 'horizontal');
  });
});
