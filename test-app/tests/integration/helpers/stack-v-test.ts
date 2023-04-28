/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import * as sinon from 'sinon';

module('Integration | helpers | stack-v', function (hooks) {
  setupRenderingTest(hooks);

  test('stack-h creates a stack with a vertical direction', async function (assert) {
    const spy = sinon.spy();
    this.setProperties({ spy });

    await render(hbs`
      {{#let (stack-v x='foo' y='bar' z='baz' data=(array)) as |stack|}}
        {{spy this.spy stack}}
      {{/let}}
    `);

    const stack = spy.getCall(0).args[0];
    assert.strictEqual(stack.direction, 'vertical');
  });

  test('stach-h will have a vertical direction, even when a horizontal direction is specified', async function (assert) {
    const spy = sinon.spy();
    this.setProperties({ spy });

    await render(hbs`
      {{#let (stack-v x='foo' y='bar' z='baz' data=(array) direction='horizontal') as |stack|}}
        {{spy this.spy stack}}
      {{/let}}
    `);

    const stack = spy.getCall(0).args[0];
    assert.strictEqual(stack.direction, 'vertical');
  });
});
