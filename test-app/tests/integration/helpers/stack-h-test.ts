import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import * as sinon from 'sinon';

module('Integration | helpers | stack-h', function (hooks) {
  setupRenderingTest(hooks);

  test('stack-h creates a stack with a horizontal direction', async function (assert) {
    const spy = sinon.spy();
    this.setProperties({ spy });

    await render(hbs`
      {{#let (stack-h x='foo' y='bar' z='baz' data=(array)) as |stack|}}
        {{spy this.spy stack}}
      {{/let}}
    `);

    const stack = spy.getCall(0).args[0];
    assert.strictEqual(stack.direction, 'horizontal');
  });

  test('stach-h will have a horizontal direction, even when a vertical direction is specified', async function (assert) {
    const spy = sinon.spy();
    this.setProperties({ spy });

    await render(hbs`
      {{#let (stack-h x='foo' y='bar' z='baz' data=(array) direction='vertical') as |stack|}}
        {{spy this.spy stack}}
      {{/let}}
    `);

    const stack = spy.getCall(0).args[0];
    assert.strictEqual(stack.direction, 'horizontal');
  });
});
