/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { array } from '@ember/helper';
import { spy } from 'sinon';
import stack from '#src/helpers/stack.ts';
import spyHelper from '#tests/helpers/spy.ts';

module('Integration | helpers | stack', function (hooks) {
  setupRenderingTest(hooks);

  test('stack creates a Stack instance with the provided config', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let (stack x="foo" y="bar" z="baz" data=(array)) as |stackInstance|}}
          {{spyHelper spyFn stackInstance}}
        {{/let}}
      </template>,
    );

    const stackInstance = spyFn.getCall(0).args[0];
    assert.ok(stackInstance, 'stack instance is created');
    assert.strictEqual(
      stackInstance.direction,
      'vertical',
      'default direction is vertical',
    );
  });

  test('stack respects the provided direction', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let
          (stack x="foo" y="bar" z="baz" data=(array) direction="horizontal")
          as |stackInstance|
        }}
          {{spyHelper spyFn stackInstance}}
        {{/let}}
      </template>,
    );

    const stackInstance = spyFn.getCall(0).args[0];
    assert.strictEqual(
      stackInstance.direction,
      'horizontal',
      'direction is horizontal when specified',
    );
  });
});
