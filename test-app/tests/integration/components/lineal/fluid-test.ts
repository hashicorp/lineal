import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

module('Integration | Component | Lineal::Fluid', function (hooks) {
  setupRenderingTest(hooks);

  test('When first rendering, width and height are immediately yielded', async function (assert) {
    await render(hbs`
      <Lineal::Fluid style='border:1px solid black; width: 100px; height: 50px' as |width height|>
        <span class='output'>{{width}} {{height}}</span>
      </Lineal::Fluid>
    `);

    // TODO: This should be replaced with a more precise wait based on the ResizeObserver
    await wait(100);
    assert.dom('.output').hasText('100 50');
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
