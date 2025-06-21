/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, rerender } from '@ember/test-helpers';
import { spy } from 'sinon';
import { Fluid } from '#src/components.ts';
import spyHelper from '#tests/helpers/spy.ts';
import { tracked } from '@glimmer/tracking';

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

module('Integration | Component | Fluid', function (hooks) {
  setupRenderingTest(hooks);

  test('When first rendering, width, height, and the ResizeObserverEntry are immediately yielded', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        <Fluid
          style="border:1px solid black; width: 100px; height: 50px"
          as |width height entry|
        >
          <span class="output">{{width}} {{height}}</span>
          {{spyHelper spyFn entry}}
        </Fluid>
      </template>,
    );

    // TODO: This should be replaced with a more precise wait based on the ResizeObserver
    await wait(100);

    assert.dom('.output').hasText('100 50');
    assert.strictEqual(spyFn.callCount, 2);
    assert.ok(spyFn.getCall(1).args[0] instanceof ResizeObserverEntry);
  });

  test('Changing the dimensions of the element triggers a recomputation of the width and height', async function (assert) {
    class State {
      @tracked style = 'width: 100px; height: 50px';
    }

    const state = new State();

    await render(
      <template>
        <Fluid style={{state.style}} as |width height|>
          <span class="output">{{width}} {{height}}</span>
        </Fluid>
      </template>,
    );

    await wait(100);
    assert.dom('.output').hasText('100 50');

    state.style = 'width: 10px; height: 400px';
    await rerender();
    await wait(100);
    assert.dom('.output').hasText('10 400');
  });
});
