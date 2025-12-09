/**
 * Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import * as sinon from 'sinon';

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

module('Integration | Component | Lineal::Fluid', function (hooks) {
  setupRenderingTest(hooks);

  test('When first rendering, width, height, and the ResizeObserverEntry are immediately yielded', async function (assert) {
    const spy = sinon.spy();
    this.setProperties({ spy });

    await render(hbs`
      <Lineal::Fluid style='border:1px solid black; width: 100px; height: 50px' as |width height entry|>
        <span class='output'>{{width}} {{height}}</span>
        {{spy this.spy entry}}
      </Lineal::Fluid>
    `);

    // TODO: This should be replaced with a more precise wait based on the ResizeObserver
    await wait(100);

    assert.dom('.output').hasText('100 50');
    assert.strictEqual(spy.callCount, 2);
    assert.ok(spy.getCall(1).args[0] instanceof ResizeObserverEntry);
  });

  test('Changing the dimensions of the element triggers a recomputation of the width and height', async function (assert) {
    this.set('style', 'width: 100px; height: 50px');

    await render(hbs`
      <Lineal::Fluid style={{this.style}} as |width height|>
        <span class='output'>{{width}} {{height}}</span>
      </Lineal::Fluid>
    `);

    await wait(100);
    assert.dom('.output').hasText('100 50');

    this.set('style', 'width: 10px; height: 400px');
    await settled();
    await wait(100);
    assert.dom('.output').hasText('10 400');
  });
});
