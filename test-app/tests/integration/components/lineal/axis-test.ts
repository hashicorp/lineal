/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, TestContext, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import * as sinon from 'sinon';
import { Scale, ScaleLinear, ScalePow } from '@lineal-viz/lineal/scale';
import { Tick } from '@lineal-viz/lineal/components/lineal/axis/index';

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
        <Lineal::Axis
          @scale={{this.scale}}
          @orientation={{this.orientation}}
          @tickSize={{10}}
          @offset={{0}} />
      </svg>
    `);

    assert.deepEqual(
      findAll('.axis g').map((el) => el.getAttribute('transform')),
      scale.d3Scale.ticks().map((t: any) => translateFn(scale, t))
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
        <Lineal::Axis @scale={{this.scale}} @orientation="bottom" @offset={{0}} />
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

  test('The tickCount arg is used to influence the number of ticks', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickCount = 3;
    this.setProperties({ scale, tickCount });

    await render(hbs`
      <svg>
        <Lineal::Axis
          @scale={{this.scale}}
          @orientation="bottom"
          @tickCount={{this.tickCount}}
          @offset={{0}} />
      </svg>
    `);

    assert.dom('.axis line').exists({ count: tickCount });

    this.set('tickCount', 8);

    assert
      .dom('.axis line')
      .exists(
        { count: 11 },
        'when the specified tickCount is not appropriate for the domain/scale, a better number is used'
      );
  });

  test('The tickValues arg is used to manually specify rendered ticks', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickValues = [0, 0.5, 1.5, 3, 5, 7.5];
    this.setProperties({ scale, tickValues });

    await render(hbs`
      <svg>
        <Lineal::Axis
          @scale={{this.scale}}
          @orientation="bottom"
          @tickValues={{this.tickValues}}
          @offset={{0}} />
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
        <Lineal::Axis
          @scale={{this.scale}}
          @orientation="bottom"
          @tickFormat={{this.tickFormat}}
          @offset={{0}} />
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
        <Lineal::Axis
          @scale={{this.scale}}
          @orientation="bottom"
          @tickFormat={{this.tickFormat}}
          @offset={{0}} />
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
        <Lineal::Axis
          @scale={{this.scale}}
          @orientation="bottom"
          @tickSize={{this.tickSize}}
          @offset={{0}} />
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
          @tickSizeInner={{this.tickSizeInner}}
          @offset={{0}} />
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
          @tickSizeOuter={{this.tickSizeOuter}}
          @offset={{0}} />
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
          @tickPadding={{this.tickPadding}}
          @offset={{0}} />
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
        <Lineal::Axis @scale={{this.scale}} @includeDomain={{this.includeDomain}} @offset={{0}} />
      </svg>
    `);

    assert.dom('.domain').exists();

    this.set('includeDomain', false);
    await settled();

    assert.dom('.domain').doesNotExist();
  });

  test('When using the block form, each tick is yielded within a translated g', async function (assert) {
    const spy = sinon.spy();
    const scale = new ScalePow({
      range: '0..100',
      domain: '1..10',
      exponent: 2,
    });
    this.setProperties({ scale, spy });

    await render(hbs`
      <svg>
        <Lineal::Axis
          @scale={{this.scale}}
          @orientation="bottom"
          @offset={{0}}
        as |tick index|>
          <text>{{index}}</text>
          {{spy this.spy tick}}
        </Lineal::Axis>
      </svg>
    `);

    // assert g elements and their translates
    assert.deepEqual(
      findAll('.axis g').map((el) => el.getAttribute('transform')),
      scale.d3Scale.ticks().map((t) => `translate(${scale.compute(t)},0)`)
    );

    // assert rendering
    assert.deepEqual(
      findAll('.axis g text')
        .map((el) => el.textContent)
        .join(' '),
      scale.d3Scale
        .ticks()
        .map((_, i) => i)
        .join(' ')
    );

    // assert tick objects
    for (const t of spy.getCalls()) {
      const tick = t.args[0] as Tick;
      assert.hasProperties(tick, [
        'transform',
        'size',
        'offset',
        'textOffset',
        'label',
        'textAnchor',
        'value',
      ]);
    }
  });

  test('When tick values change, <g> elements are updated instead of recreated', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickValues = [0, 0.5, 1.5, 3, 5, 7.5];
    this.setProperties({ scale, tickValues });

    assert.expect(tickValues.length);

    await render(hbs`
      <svg>
        <Lineal::Axis
          @scale={{this.scale}}
          @orientation="bottom"
          @tickValues={{this.tickValues}}
          @offset={{0}} />
      </svg>
    `);

    const firstTicks = findAll('.axis g');

    this.set('tickValues', [1, 1.5, 2.5, 4, 6, 8.5]);

    const secondTicks = findAll('.axis g');

    firstTicks.forEach((tick, idx) => {
      assert.strictEqual(tick, secondTicks[idx]);
    });
  });
});
