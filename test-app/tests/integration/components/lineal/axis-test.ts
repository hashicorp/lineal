import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, TestContext, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { Scale, ScaleLinear } from 'lineal-viz/scale';

function orientationTest(
  orientation: string,
  lineAttr: string,
  attrValue: string,
  translateFn: (scale: Scale, value: number) => string
) {
  return async function (this: TestContext, assert: Assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    this.setProperties({ scale, orientation });

    await render(hbs`
      <svg>
        <Lineal::Axis @scale={{this.scale}} @orientation={{this.orientation}} @tickSize={{10}} />
      </svg>
    `);

    assert.deepEqual(
      findAll('.axis g').map((el) => el.getAttribute('transform')),
      scale.d3Scale.ticks().map((t) => translateFn(scale, t))
    );

    assert.deepEqual(
      findAll('.axis line').map((el) => el.getAttribute(lineAttr)),
      Array(scale.d3Scale.ticks().length).fill(attrValue)
    );
  };
}

module('Integration | Component | Lineal::Axis', function (hooks) {
  setupRenderingTest(hooks);

  test('Given a scale and an orientation, renders ticks and labels', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    this.setProperties({ scale });

    await render(hbs`
      <svg>
        <Lineal::Axis @scale={{this.scale}} @orientation="bottom" />
      </svg>
    `);

    assert.strictEqual(
      findAll('.axis text').length,
      scale.d3Scale.ticks().length
    );
    assert.strictEqual(
      findAll('.axis line').length,
      scale.d3Scale.ticks().length
    );
  });

  test(
    'Axis can have an orientation of top',
    orientationTest(
      'top',
      'y2',
      '-10',
      (s, t) => `translate(${s.compute(t)},0)`
    )
  );

  test(
    'Axis can have an orientation of right',
    orientationTest(
      'right',
      'x2',
      '10',
      (s, t) => `translate(0,${s.compute(t)})`
    )
  );

  test(
    'Axis can have an orientation of bottom',
    orientationTest(
      'bottom',
      'y2',
      '10',
      (s, t) => `translate(${s.compute(t)},0)`
    )
  );

  test(
    'Axis can have an orientation of left',
    orientationTest(
      'left',
      'x2',
      '-10',
      (s, t) => `translate(0,${s.compute(t)})`
    )
  );

  test('The tickValues arg is used to manually specify rendered ticks', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickValues = [0, 0.5, 1.5, 3, 5, 7.5];
    this.setProperties({ scale, tickValues });

    await render(hbs`
      <svg>
        <Lineal::Axis @scale={{this.scale}} @orientation="bottom" @tickValues={{this.tickValues}} />
      </svg>
    `);

    assert.deepEqual(
      findAll('.axis text').map((el) => el.textContent),
      tickValues.map((t) => scale.d3Scale.tickFormat()(t))
    );

    assert.deepEqual(
      findAll('.axis g').map((el) => el.getAttribute('transform')),
      tickValues.map((t) => `translate(${scale.compute(t)},0)`)
    );
  });

  test('The tickFormat arg is used to manually specify how tick labels are formatted', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickFormat = (t: number) =>
      Math.round(t) % 2 === 0 ? 'even' : 'odd';
    this.setProperties({ scale, tickFormat });

    await render(hbs`
      <svg>
        <Lineal::Axis @scale={{this.scale}} @orientation="bottom" @tickFormat={{this.tickFormat}} />
      </svg>
    `);

    assert.deepEqual(
      findAll('.axis text').map((el) => el.textContent),
      'even odd even odd even odd even odd even odd even'.split(' ')
    );
  });

  test('When tickFormat returns a nullish value for a tick, a label is not rendered', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickFormat = (t: number) => Math.round(t) % 2 === 0 && '' + t;
    this.setProperties({ scale, tickFormat });

    await render(hbs`
      <svg>
        <Lineal::Axis @scale={{this.scale}} @orientation="bottom" @tickFormat={{this.tickFormat}} />
      </svg>
    `);

    assert.strictEqual(findAll('.axis text').length, 6);
    assert.strictEqual(findAll('.axis line').length, 11);
    assert.deepEqual(
      findAll('.axis text').map((el) => el.textContent),
      ['0', '2', '4', '6', '8', '10']
    );
  });

  test('tickSize controls both the inner ticks as well as the outer ticks', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickSize = 10;
    this.setProperties({ scale, tickSize });

    await render(hbs`
      <svg>
        <Lineal::Axis @scale={{this.scale}} @orientation="bottom" @tickSize={{this.tickSize}} />
      </svg>
    `);

    assert.deepEqual(
      findAll('.axis line').map((el) => el.getAttribute('y2')),
      Array(scale.d3Scale.ticks().length).fill(tickSize.toString())
    );

    assert
      .dom('.axis .domain')
      .hasAttribute('d', `M0,${tickSize}V0H100V${tickSize}`);
  });

  test('tickSizeInner overrides tickSize', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickSize = 10;
    const tickSizeInner = 5;
    this.setProperties({ scale, tickSize, tickSizeInner });

    await render(hbs`
      <svg>
        <Lineal::Axis
          @scale={{this.scale}}
          @orientation="bottom"
          @tickSize={{this.tickSize}}
          @tickSizeInner={{this.tickSizeInner}} />
      </svg>
    `);

    assert.deepEqual(
      findAll('.axis line').map((el) => el.getAttribute('y2')),
      Array(scale.d3Scale.ticks().length).fill(tickSizeInner.toString())
    );

    assert
      .dom('.axis .domain')
      .hasAttribute('d', `M0,${tickSize}V0H100V${tickSize}`);
  });

  test('tickSizeOuter overrides tickSize', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickSize = 10;
    const tickSizeOuter = 5;
    this.setProperties({ scale, tickSize, tickSizeOuter });

    await render(hbs`
      <svg>
        <Lineal::Axis
          @scale={{this.scale}}
          @orientation="bottom"
          @tickSize={{this.tickSize}}
          @tickSizeOuter={{this.tickSizeOuter}} />
      </svg>
    `);

    assert.deepEqual(
      findAll('.axis line').map((el) => el.getAttribute('y2')),
      Array(scale.d3Scale.ticks().length).fill(tickSize.toString())
    );

    assert
      .dom('.axis .domain')
      .hasAttribute('d', `M0,${tickSizeOuter}V0H100V${tickSizeOuter}`);
  });

  test('The tickPadding arg is used to specify the distance from tick marks and tick labels', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickSize = 10;
    const tickPadding = 20;
    const orientation = 'bottom';
    this.setProperties({ scale, tickSize, tickPadding, orientation });

    await render(hbs`
      <svg>
        <Lineal::Axis
          @scale={{this.scale}}
          @orientation={{this.orientation}}
          @tickSize={{this.tickSize}}
          @tickPadding={{this.tickPadding}} />
      </svg>
    `);

    assert.deepEqual(
      findAll('.axis text').map((el) => el.getAttribute('y')),
      Array(scale.d3Scale.ticks().length).fill(tickSize + tickPadding + '')
    );

    this.set('orientation', 'left');
    await settled();

    assert.deepEqual(
      findAll('.axis text').map((el) => el.getAttribute('x')),
      Array(scale.d3Scale.ticks().length).fill(
        -1 * (tickSize + tickPadding) + ''
      )
    );
  });

  test('When includeDomain is false, the domain is not rendered', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const includeDomain = true;
    this.setProperties({ scale, includeDomain });

    await render(hbs`
      <svg>
        <Lineal::Axis @scale={{this.scale}} @includeDomain={{this.includeDomain}} />
      </svg>
    `);

    assert.dom('.domain').exists();

    this.set('includeDomain', false);
    await settled();

    assert.dom('.domain').doesNotExist();
  });
});
