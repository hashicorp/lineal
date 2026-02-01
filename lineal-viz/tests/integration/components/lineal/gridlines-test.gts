/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, rerender } from '@ember/test-helpers';
import { ScaleLinear } from '#src/scale.ts';
import { GridLines } from '#src/components.ts';
import { Direction } from '#src/components/grid-lines.gts';
import { tracked } from '@glimmer/tracking';

interface Attrs {
  [property: string]: string | null;
}

const attrs = (el: Element, ...attributes: string[]): Attrs =>
  attributes.reduce((obj: Attrs, attr: string) => {
    obj[attr] = el.getAttribute(attr);
    return obj;
  }, {});

module('Integration | Component | GridLines', function (hooks) {
  setupRenderingTest(hooks);

  test('Given a scale, a direction, and a length, renders gridlines', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });

    await render(
      <template>
        <svg>
          <GridLines
            @scale={{scale}}
            @direction={{Direction.Horizontal}}
            @length={{100}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    assert.deepEqual(
      findAll('.grid-lines line').map((el) =>
        attrs(el, 'x1', 'x2', 'y1', 'y2'),
      ),
      scale.d3Scale.ticks().map((t: any) => ({
        x1: '0',
        x2: '100',
        y1: '' + scale.compute(t),
        y2: '' + scale.compute(t),
      })),
    );
  });

  test('The lineCount arg is used to influence the number of lines', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });

    class State {
      @tracked lineCount = 3;
    }

    const state = new State();

    await render(
      <template>
        <svg>
          <GridLines
            @scale={{scale}}
            @lineCount={{state.lineCount}}
            @direction={{Direction.Vertical}}
            @length={{100}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    assert.dom('.grid-lines line').exists({ count: state.lineCount });

    state.lineCount = 8;

    await rerender();

    assert
      .dom('.grid-lines line')
      .exists(
        { count: 11 },
        'when the specified lineCount is not appropriate for the domain/scale, a better number is used',
      );
  });

  test('The lineValues arg is used to manually specify gridline positions', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const lineValues = [0, 10, 20, 30, 50, 80];

    await render(
      <template>
        <svg>
          <GridLines
            @scale={{scale}}
            @lineValues={{lineValues}}
            @direction={{Direction.Vertical}}
            @length={{100}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    assert.deepEqual(
      findAll('.grid-lines line').map((el) =>
        attrs(el, 'x1', 'x2', 'y1', 'y2'),
      ),
      lineValues.map((t: any) => ({
        x1: '' + scale.compute(t),
        x2: '' + scale.compute(t),
        y1: '0',
        y2: '100',
      })),
    );
  });

  test('When line values change, <line> elements are updated instead of recreated', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });

    class State {
      @tracked lineValues = [0, 10, 20, 30, 50, 80];
    }

    const state = new State();

    assert.ok(state.lineValues.length);

    await render(
      <template>
        <svg>
          <GridLines
            @scale={{scale}}
            @lineValues={{state.lineValues}}
            @direction={{Direction.Vertical}}
            @length={{100}}
            @offset={{0}}
          />
        </svg>
      </template>,
    );

    const firstLines = findAll('line');

    state.lineValues = [5, 15, 25, 35, 55, 85];

    await rerender();

    const secondLines = findAll('line');

    firstLines.forEach((line, idx) => {
      assert.strictEqual(line, secondLines[idx]);
    });
  });
});
