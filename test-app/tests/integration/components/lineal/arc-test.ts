import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import * as sinon from 'sinon';
import { arc } from 'd3-shape';

module('Integration | Component | Lineal::Arc', function (hooks) {
  setupRenderingTest(hooks);

  test('When given no arguments, renders a circle', async function (assert) {
    await render(hbs`
      <svg>
        <Lineal::Arc />
      </svg>
    `);

    const arcGenerator = arc()
      .outerRadius(100)
      .innerRadius(0)
      .startAngle(0)
      .endAngle(Math.PI * 2);

    // @ts-expect-error Expected at least 1 argument
    assert.dom('path').hasAttribute('d', arcGenerator());
  });

  test('The arc can be defined using @innerRadius, @outerRadius, @cornerRadius, @padRadius, @startAngle, @endAngle, and @padAngle just like the d3 arc generator', async function (assert) {
    await render(hbs`
      <svg>
        <Lineal::Arc
          @innerRadius='10'
          @outerRadius='250'
          @cornerRadius='5'
          @padRadius='8'
          @startAngle='45d'
          @endAngle='135d'
          @padAngle='18d'
        />
      </svg>
    `);

    const arcGenerator = arc()
      .outerRadius(250)
      .innerRadius(10)
      .cornerRadius(5)
      .padRadius(8)
      .startAngle(Math.PI / 4)
      .endAngle((Math.PI * 3) / 4)
      .padAngle(Math.PI / 10);

    // @ts-expect-error Expected at least 1 argument
    assert.dom('path').hasAttribute('d', arcGenerator());
  });

  test('The arc component yields the centroid of the drawn arc', async function (assert) {
    const spy = sinon.spy();
    this.setProperties({ spy });

    await render(hbs`
      <svg>
        <Lineal::Arc as |arc|>
          {{this.spy arc.centroid}}
        </Lineal::Arc>
      </svg>
    `);

    const arcGenerator = arc()
      .outerRadius(100)
      .innerRadius(0)
      .startAngle(0)
      .endAngle(Math.PI * 2);

    // @ts-expect-error Expected at least 1 argument
    const [x, y] = arcGenerator.centroid();
    assert.deepEqual(spy.getCall(0).args[0], { x, y });
  });
});
