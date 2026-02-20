/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, rerender } from '@ember/test-helpers';
import { spy } from 'sinon';
import { ScaleLinear, ScalePow } from '#src/utils/scale.ts';
import { Axis } from '#src/components.ts';
import { Orientation } from '#src/components/axis.gts';

import type { TestContext } from '@ember/test-helpers';
import type { Scale } from '#src/utils/scale.ts';
import type { Tick } from '#src/components/axis.gts';
import { tracked } from '@glimmer/tracking';
import spyHelper from '#tests/helpers/spy.ts';

function orientationTest(
  orientation: Orientation,
  lineAttr: string,
  attrValue: string,
  translateFn: (scale: Scale, value: number) => string,
) {
  // eslint-disable-next-line no-undef
  return async function (this: TestContext, assert: Assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });

    await render(
      <template>
        <svg>
          <Axis
            @scale={{scale}}
            @orientation={{orientation}}
            @tickSize={{10}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    assert.deepEqual(
      findAll('.axis g').map((el) => el.getAttribute('transform')),
      scale.d3Scale.ticks().map((t: any) => translateFn(scale, t)),
    );

    assert.deepEqual(
      findAll('.axis line').map((el) => el.getAttribute(lineAttr)),
      Array(scale.d3Scale.ticks().length).fill(attrValue),
    );
  };
}

module('Integration | Component | Axis', function (hooks) {
  setupRenderingTest(hooks);

  test('Given a scale and an orientation, renders ticks and labels', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });

    await render(
      <template>
        <svg>
          <Axis
            @scale={{scale}}
            @orientation={{Orientation.Bottom}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    assert.strictEqual(
      findAll('.axis text').length,
      scale.d3Scale.ticks().length,
    );
    assert.strictEqual(
      findAll('.axis line').length,
      scale.d3Scale.ticks().length,
    );
  });

  test(
    'Axis can have an orientation of top',
    orientationTest(
      Orientation.Top,
      'y2',
      '-10',
      (s, t) => `translate(${s.compute(t)},0)`,
    ),
  );

  test(
    'Axis can have an orientation of right',
    orientationTest(
      Orientation.Right,
      'x2',
      '10',
      (s, t) => `translate(0,${s.compute(t)})`,
    ),
  );

  test(
    'Axis can have an orientation of bottom',
    orientationTest(
      Orientation.Bottom,
      'y2',
      '10',
      (s, t) => `translate(${s.compute(t)},0)`,
    ),
  );

  test(
    'Axis can have an orientation of left',
    orientationTest(
      Orientation.Left,
      'x2',
      '-10',
      (s, t) => `translate(0,${s.compute(t)})`,
    ),
  );

  test('The tickCount arg is used to influence the number of ticks', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });

    class State {
      @tracked tickCount = 3;
    }
    const state = new State();

    await render(
      <template>
        <svg>
          <Axis
            @scale={{scale}}
            @orientation={{Orientation.Bottom}}
            @tickCount={{state.tickCount}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    assert.dom('.axis line').exists({ count: state.tickCount });

    state.tickCount = 8;

    await rerender();

    assert
      .dom('.axis line')
      .exists(
        { count: 11 },
        'when the specified tickCount is not appropriate for the domain/scale, a better number is used',
      );
  });

  test('The tickValues arg is used to manually specify rendered ticks', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickValues = [0, 0.5, 1.5, 3, 5, 7.5];

    await render(
      <template>
        <svg>
          <Axis
            @scale={{scale}}
            @orientation={{Orientation.Bottom}}
            @tickValues={{tickValues}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    assert.deepEqual(
      findAll('.axis text').map((el) => el.textContent),
      tickValues.map((t) => scale.d3Scale.tickFormat()(t)),
    );

    assert.deepEqual(
      findAll('.axis g').map((el) => el.getAttribute('transform')),
      tickValues.map((t) => `translate(${scale.compute(t)},0)`),
    );
  });

  test('The tickFormat arg is used to manually specify how tick labels are formatted', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickFormat = (t: number) =>
      Math.round(t) % 2 === 0 ? 'even' : 'odd';

    await render(
      <template>
        <svg>
          <Axis
            @scale={{scale}}
            @orientation={{Orientation.Bottom}}
            @tickFormat={{tickFormat}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    assert.deepEqual(
      findAll('.axis text').map((el) => el.textContent),
      'even odd even odd even odd even odd even odd even'.split(' '),
    );
  });

  test('When tickFormat returns a nullish value for a tick, a label is not rendered', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickFormat = (t: number): string =>
      Math.round(t) % 2 === 0 ? '' + t : '';

    await render(
      <template>
        <svg>
          <Axis
            @scale={{scale}}
            @orientation={{Orientation.Bottom}}
            @tickFormat={{tickFormat}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    assert.strictEqual(findAll('.axis text').length, 6);
    assert.strictEqual(findAll('.axis line').length, 11);
    assert.deepEqual(
      findAll('.axis text').map((el) => el.textContent),
      ['0', '2', '4', '6', '8', '10'],
    );
  });

  test('tickSize controls both the inner ticks as well as the outer ticks', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickSize = 10;

    await render(
      <template>
        <svg>
          <Axis
            @scale={{scale}}
            @orientation={{Orientation.Bottom}}
            @tickSize={{tickSize}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    assert.deepEqual(
      findAll('.axis line').map((el) => el.getAttribute('y2')),
      Array(scale.d3Scale.ticks().length).fill(tickSize.toString()),
    );

    assert
      .dom('.axis .domain')
      .hasAttribute('d', `M0,${tickSize}V0H100V${tickSize}`);
  });

  test('tickSizeInner overrides tickSize', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickSize = 10;
    const tickSizeInner = 5;

    await render(
      <template>
        <svg>
          <Axis
            @scale={{scale}}
            @orientation={{Orientation.Bottom}}
            @tickSize={{tickSize}}
            @tickSizeInner={{tickSizeInner}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    assert.deepEqual(
      findAll('.axis line').map((el) => el.getAttribute('y2')),
      Array(scale.d3Scale.ticks().length).fill(tickSizeInner.toString()),
    );

    assert
      .dom('.axis .domain')
      .hasAttribute('d', `M0,${tickSize}V0H100V${tickSize}`);
  });

  test('tickSizeOuter overrides tickSize', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickSize = 10;
    const tickSizeOuter = 5;

    await render(
      <template>
        <svg>
          <Axis
            @scale={{scale}}
            @orientation={{Orientation.Bottom}}
            @tickSize={{tickSize}}
            @tickSizeOuter={{tickSizeOuter}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    assert.deepEqual(
      findAll('.axis line').map((el) => el.getAttribute('y2')),
      Array(scale.d3Scale.ticks().length).fill(tickSize.toString()),
    );

    assert
      .dom('.axis .domain')
      .hasAttribute('d', `M0,${tickSizeOuter}V0H100V${tickSizeOuter}`);
  });

  test('The tickPadding arg is used to specify the distance from tick marks and tick labels', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const tickSize = 10;
    const tickPadding = 20;

    class State {
      @tracked orientation = Orientation.Bottom;
    }

    const state = new State();

    await render(
      <template>
        <svg>
          <Axis
            @scale={{scale}}
            @orientation={{state.orientation}}
            @tickSize={{tickSize}}
            @tickPadding={{tickPadding}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    assert.deepEqual(
      findAll('.axis text').map((el) => el.getAttribute('y')),
      Array(scale.d3Scale.ticks().length).fill(tickSize + tickPadding + ''),
    );

    state.orientation = Orientation.Left;
    await rerender();

    assert.deepEqual(
      findAll('.axis text').map((el) => el.getAttribute('x')),
      Array(scale.d3Scale.ticks().length).fill(
        -1 * (tickSize + tickPadding) + '',
      ),
    );
  });

  test('When includeDomain is false, the domain is not rendered', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });

    class State {
      @tracked includeDomain = true;
    }
    const state = new State();

    await render(
      <template>
        <svg>
          <Axis
            @scale={{scale}}
            @orientation={{Orientation.Bottom}}
            @includeDomain={{state.includeDomain}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    assert.dom('.domain').exists();

    state.includeDomain = false;
    await rerender();

    assert.dom('.domain').doesNotExist();
  });

  test('When using the block form, each tick is yielded within a translated g', async function (assert) {
    const spyFn = spy();
    const scale = new ScalePow({
      range: '0..100',
      domain: '1..10',
      exponent: 2,
    });

    await render(
      <template>
        <svg>
          <Axis
            @scale={{scale}}
            @orientation={{Orientation.Bottom}}
            @offset={{0}}
            as |tick index|
          >
            <text>{{index}}</text>
            {{spyHelper spyFn tick}}
          </Axis>
        </svg>
      </template>,
    );

    // assert g elements and their translates
    assert.deepEqual(
      findAll('.axis g').map((el) => el.getAttribute('transform')),
      scale.d3Scale.ticks().map((t) => `translate(${scale.compute(t)},0)`),
    );

    // assert rendering
    assert.deepEqual(
      findAll('.axis g text')
        .map((el) => el.textContent)
        .join(' '),
      scale.d3Scale
        .ticks()
        .map((_, i) => i)
        .join(' '),
    );

    // assert tick objects
    for (const t of spyFn.getCalls()) {
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

    class State {
      @tracked tickValues = [0, 0.5, 1.5, 3, 5, 7.5];
    }

    const state = new State();

    assert.ok(state.tickValues.length);

    await render(
      <template>
        <svg>
          <Axis
            @scale={{scale}}
            @orientation={{Orientation.Bottom}}
            @tickValues={{state.tickValues}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    const firstTicks = findAll('.axis g');

    state.tickValues = [1, 1.5, 2.5, 4, 6, 8.5];

    await rerender();

    const secondTicks = findAll('.axis g');

    firstTicks.forEach((tick, idx) => {
      assert.strictEqual(tick, secondTicks[idx]);
    });
  });
});
