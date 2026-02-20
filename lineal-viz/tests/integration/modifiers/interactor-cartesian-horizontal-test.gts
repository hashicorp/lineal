/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  find,
  triggerEvent,
  triggerKeyEvent,
  click,
  focus,
} from '@ember/test-helpers';
import { spy } from 'sinon';
import { ScaleLinear } from '#src/utils/scale.ts';
import { Encoding } from '#src/utils/encoding.ts';
import interactorCartesianHorizontal from '#src/modifiers/interactor-cartesian-horizontal.ts';

import type { ActiveDatum } from '#src/modifiers/interactor-cartesian-horizontal.ts';
import { array } from '@ember/helper';

const linearData = [
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 2, y: 2 },
  { x: 3, y: 3 },
  { x: 4, y: 5 },
  { x: 5, y: 8 },
  { x: 6, y: 13 },
  { x: 7, y: 21 },
  { x: 8, y: 34 },
  { x: 9, y: 55 },
  { x: 10, y: 89 },
];

const staggeredData = [
  { x: 0, a: 1, b: 0, c: 0 },
  { x: 1, a: 1, b: 1, c: 1 },
  { x: 2, a: 2, b: 2, c: 2 },
  { x: 3, a: 3, b: 3, c: 3 },
  { x: 4, a: 5, c: 4 },
  { x: 5, a: 8 },
  { x: 5.2, c: 5.2 },
  { x: 6, a: 13, b: 6, c: 6 },
  { x: 7, a: 21, b: 7, c: 7 },
  { x: 8, a: 34, b: 8, c: 8 },
  { x: 9, a: 55, b: 9, c: 9 },
  { x: 10, a: 89, b: 10, c: 10 },
];

const triggerMouseMove = async (
  element: string | SVGGraphicsElement,
  x: number,
  y: number,
) => {
  const el: SVGGraphicsElement | null = (
    element instanceof Element ? element : find(element)
  ) as SVGGraphicsElement;

  const bbox = el?.getBoundingClientRect();

  if (el && bbox) {
    const scale = bbox.width / el.getBBox().width;
    await triggerEvent(el, 'mousemove', {
      clientX: bbox.left + x * scale,
      clientY: bbox.top + y * scale,
    });
  } else {
    throw new Error('Cannot fire mousemove event, element not found');
  }
};

const triggerClick = async (
  element: string | SVGGraphicsElement,
  x: number,
  y: number,
) => {
  const el: SVGGraphicsElement | null = (
    element instanceof Element ? element : find(element)
  ) as SVGGraphicsElement;

  const bbox = el?.getBoundingClientRect();

  if (el && bbox) {
    const scale = bbox.width / el.getBBox().width;
    await click(el, {
      clientX: bbox.left + x * scale,
      clientY: bbox.top + y * scale,
    });
  } else {
    throw new Error('Cannot fire mousemove event, element not found');
  }
};

module(
  'Integration | Modifier | interactor-caresian-horizontal',
  function (hooks) {
    setupRenderingTest(hooks);

    test('The mousemove event calls the onSeek handler with the data under the mouse', async function (assert) {
      const scale = new ScaleLinear({ domain: [0, 10], range: [0, 100] });
      const onSeek = spy();

      await render(
        <template>
          <svg>
            <rect
              x="0"
              y="0"
              width="100"
              height="10"
              {{interactorCartesianHorizontal
                data=linearData
                xScale=scale
                x="x"
                y="y"
                onSeek=onSeek
              }}
            ></rect>
          </svg>
        </template>,
      );

      await triggerMouseMove('rect', 50, 25);

      assert.ok(onSeek.calledOnce);
      assert.deepEqual(
        onSeek.getCall(0).args[0].datum.datum,
        linearData.find((d) => d.x === scale.d3Scale.invert(50)),
      );
    });

    test('The click event calls the onSelect handler with the datum under the mouse', async function (assert) {
      const scale = new ScaleLinear({ domain: [0, 10], range: [0, 100] });
      const onSelect = spy();

      await render(
        <template>
          <svg>
            <rect
              x="0"
              y="0"
              width="100"
              height="10"
              {{interactorCartesianHorizontal
                data=linearData
                xScale=scale
                x="x"
                y="y"
                onSelect=onSelect
              }}
            ></rect>
          </svg>
        </template>,
      );

      await triggerClick('rect', 53, 25);

      assert.ok(onSelect.calledOnce);
      assert.deepEqual(
        onSelect.getCall(0).args[0].datum,
        linearData.find((d) => d.x === scale.d3Scale.invert(50)),
      );
    });

    test('The mouseleave event calls the onSeek and onSelect handlers with null', async function (assert) {
      const scale = new ScaleLinear({ domain: [0, 10], range: [0, 100] });
      const onSelect = spy();
      const onSeek = spy();

      await render(
        <template>
          <svg>
            <rect
              x="0"
              y="0"
              width="100"
              height="10"
              {{interactorCartesianHorizontal
                data=linearData
                xScale=scale
                x="x"
                y="y"
                onSelect=onSelect
                onSeek=onSeek
              }}
            ></rect>
          </svg>
        </template>,
      );

      await triggerMouseMove('rect', 53, 25);
      await triggerClick('rect', 53, 25);
      await triggerEvent('rect', 'mouseleave');

      assert.ok(onSelect.calledTwice);
      assert.ok(onSeek.calledTwice);
      assert.strictEqual(onSelect.getCall(1).args[0], null);
      assert.strictEqual(onSeek.getCall(1).args[0], null);
    });

    test('when the modifier is used without providing onSeek or onSelect handlers, the modifier performs gracefully', async function (assert) {
      const scale = new ScaleLinear({ domain: [0, 10], range: [0, 100] });

      await render(
        <template>
          <svg>
            <rect
              x="0"
              y="0"
              width="100"
              height="10"
              {{interactorCartesianHorizontal
                data=linearData
                xScale=scale
                x="x"
                y="y"
              }}
            ></rect>
          </svg>
        </template>,
      );

      await triggerMouseMove('rect', 53, 25);
      await triggerClick('rect', 53, 25);
      await triggerEvent('rect', 'mouseleave');

      assert.ok(true);
    });

    test('when multiple data points have the same x value, they are all provided to onSeek', async function (assert) {
      const multiSeriesData = [
        { x: 0, y: 1, group: 'A' },
        { x: 0, y: 1 * 5, group: 'B' },
        { x: 1, y: 1, group: 'A' },
        { x: 1, y: 1 * 5, group: 'B' },
        { x: 2, y: 2, group: 'A' },
        { x: 2, y: 2 * 5, group: 'B' },
        { x: 3, y: 3, group: 'A' },
        { x: 3, y: 3 * 5, group: 'B' },
        { x: 4, y: 5, group: 'A' },
        { x: 4, y: 5 * 5, group: 'B' },
        { x: 5, y: 8, group: 'A' },
        { x: 5, y: 8 * 5, group: 'B' },
      ];

      const scale = new ScaleLinear({ domain: [0, 5], range: [0, 100] });
      const onSeek = spy();
      const onSelect = spy();

      await render(
        <template>
          <svg>
            <rect
              x="0"
              y="0"
              width="100"
              height="10"
              {{interactorCartesianHorizontal
                data=multiSeriesData
                xScale=scale
                x="x"
                y="y"
                onSeek=onSeek
                onSelect=onSelect
              }}
            ></rect>
          </svg>
        </template>,
      );

      await triggerMouseMove('rect', 40, 25);

      assert.ok(onSeek.calledOnce);
      assert.deepEqual(
        onSeek.getCall(0).args[0].data.map((d: ActiveDatum) => d.datum),
        multiSeriesData.filter((d) => d.x === scale.d3Scale.invert(40)),
      );

      await triggerClick('rect', 43, 25);

      assert.ok(onSelect.calledOnce);
      assert.deepEqual(
        onSelect.getCall(0).args[0].datum,
        multiSeriesData.find((d) => d.x === scale.d3Scale.invert(40)),
      );
    });

    test('when multiple y encodings are provided, the datum provided to onSeek and onSelect is the one closest to the cursor', async function (assert) {
      const linearData = [
        { x: 0, a: 1, b: 0, c: 0 },
        { x: 1, a: 1, b: 1, c: 1 },
        { x: 2, a: 2, b: 2, c: 2 },
        { x: 3, a: 3, b: 3, c: 3 },
        { x: 4, a: 5, b: 4, c: 4 },
        { x: 4.8, b: 4.8 },
        { x: 5, a: 8 },
        { x: 5.2, c: 5.2 },
        { x: 6, a: 13, b: 6, c: 6 },
        { x: 7, a: 21, b: 7, c: 7 },
        { x: 8, a: 34, b: 8, c: 8 },
        { x: 9, a: 55, b: 9, c: 9 },
        { x: 10, a: 89, b: 10, c: 10 },
      ];

      const scale = new ScaleLinear({ domain: [0, 10], range: [0, 100] });
      const onSelect = spy();
      const onSeek = spy();

      await render(
        <template>
          <svg>
            <rect
              x="0"
              y="0"
              width="100"
              height="10"
              {{interactorCartesianHorizontal
                data=linearData
                xScale=scale
                x="x"
                y=(array "a" "b" "c")
                onSelect=onSelect
                onSeek=onSeek
              }}
            ></rect>
          </svg>
        </template>,
      );

      await triggerMouseMove('rect', 50, 25);
      await triggerClick('rect', 50, 25);

      assert.deepEqual(onSelect.getCall(0).args[0].datum, { x: 5, a: 8 });
      assert.deepEqual(onSeek.getCall(0).args[0].datum.datum, { x: 5, a: 8 });
      assert.deepEqual(
        onSeek.getCall(0).args[0].data.map((d: { datum: unknown }) => d.datum),
        [
          { x: 5, a: 8 },
          { x: 4.8, b: 4.8 },
          { x: 5.2, c: 5.2 },
        ],
      );
      assert.deepEqual(
        onSeek
          .getCall(0)
          .args[0].data.map((d: { encoding: Encoding }) => d.encoding.field),
        ['a', 'b', 'c'],
      );
    });

    test('when multiple y encodings are provided, the data provided to onSeek includes the closest datum per encoding within the distanceThreshold', async function (assert) {
      const scale = new ScaleLinear({ domain: [0, 10], range: [0, 100] });
      const onSeek = spy();

      await render(
        <template>
          <svg>
            <rect
              x="0"
              y="0"
              width="100"
              height="10"
              {{interactorCartesianHorizontal
                data=staggeredData
                xScale=scale
                x="x"
                y=(array "a" "b" "c")
                distanceThreshold=10
                onSeek=onSeek
              }}
            ></rect>
          </svg>
        </template>,
      );

      await triggerMouseMove('rect', 50, 25);
      await triggerClick('rect', 50, 25);

      assert.deepEqual(onSeek.getCall(0).args[0].datum.datum, { x: 5, a: 8 });
      assert.deepEqual(
        onSeek.getCall(0).args[0].data.map((d: { datum: unknown }) => d.datum),
        [
          { x: 5, a: 8 },
          { x: 5.2, c: 5.2 },
        ],
      );
      assert.deepEqual(
        onSeek
          .getCall(0)
          .args[0].data.map((d: { encoding: Encoding }) => d.encoding.field),
        ['a', 'c'],
      );
    });

    test('the left and right arrow keys cycle through the provided data', async function (assert) {
      const scale = new ScaleLinear({ domain: [0, 10], range: [0, 100] });
      const onSeek = spy();

      await render(
        <template>
          <svg>
            <rect
              x="0"
              y="0"
              width="100"
              height="10"
              tabindex="0"
              {{interactorCartesianHorizontal
                data=linearData
                xScale=scale
                x="x"
                y="y"
                onSeek=onSeek
              }}
            ></rect>
          </svg>
        </template>,
      );

      await focus('rect');
      await triggerKeyEvent('rect', 'keydown', 'ArrowRight');
      await triggerKeyEvent('rect', 'keydown', 'ArrowRight');

      assert.ok(onSeek.calledTwice);
      assert.deepEqual(onSeek.getCall(0).args[0].datum.datum, linearData[1]);
      assert.deepEqual(onSeek.getCall(1).args[0].datum.datum, linearData[2]);
    });

    test('when seeking with the keyboard, data for each encoding within the distance threshold is still captured', async function (assert) {
      const scale = new ScaleLinear({ domain: [0, 10], range: [0, 100] });
      const onSeek = spy();

      await render(
        <template>
          <svg>
            <rect
              x="0"
              y="0"
              width="100"
              height="10"
              tabindex="0"
              {{interactorCartesianHorizontal
                data=staggeredData
                xScale=scale
                x="x"
                y=(array "a" "b" "c")
                distanceThreshold=10
                onSeek=onSeek
              }}
            ></rect>
          </svg>
        </template>,
      );

      // Seek to the middle of the chart where the datasets split
      await focus('rect');
      for (let i = 0; i < 5; i++) {
        await triggerKeyEvent('rect', 'keydown', 'ArrowRight');
      }

      // Each key event calls onSeek, this is the last one
      const call = 4;

      assert.deepEqual(onSeek.getCall(call).args[0].datum.datum, {
        x: 5,
        a: 8,
      });
      assert.deepEqual(
        onSeek
          .getCall(call)
          .args[0].data.map((d: { datum: unknown }) => d.datum),
        [
          { x: 5, a: 8 },
          { x: 5.2, c: 5.2 },
        ],
      );
      assert.deepEqual(
        onSeek
          .getCall(call)
          .args[0].data.map((d: { encoding: Encoding }) => d.encoding.field),
        ['a', 'c'],
      );
    });

    test('the escape key calls onSeek and onSelect with null', async function (assert) {
      const scale = new ScaleLinear({ domain: [0, 10], range: [0, 100] });
      const onSeek = spy();
      const onSelect = spy();

      await render(
        <template>
          <svg>
            <rect
              x="0"
              y="0"
              width="100"
              height="10"
              tabindex="0"
              {{interactorCartesianHorizontal
                data=linearData
                xScale=scale
                x="x"
                y="y"
                onSeek=onSeek
                onSelect=onSelect
              }}
            ></rect>
          </svg>
        </template>,
      );

      await focus('rect');
      await triggerKeyEvent('rect', 'keydown', 'ArrowRight');
      await triggerKeyEvent('rect', 'keydown', 'Escape');

      assert.ok(onSeek.calledTwice);
      assert.deepEqual(onSeek.getCall(0).args[0].datum.datum, linearData[1]);
      assert.deepEqual(onSeek.getCall(1).args[0], null);

      assert.ok(onSelect.calledOnce);
      assert.deepEqual(onSelect.getCall(0).args[0], null);
    });

    test('the space and enter keys call onSelect, matching button semantics', async function (assert) {
      const scale = new ScaleLinear({ domain: [0, 10], range: [0, 100] });
      const onSeek = spy();
      const onSelect = spy();

      await render(
        <template>
          <svg>
            <rect
              x="0"
              y="0"
              width="100"
              height="10"
              tabindex="0"
              {{interactorCartesianHorizontal
                data=linearData
                xScale=scale
                x="x"
                y="y"
                onSeek=onSeek
                onSelect=onSelect
              }}
            ></rect>
          </svg>
        </template>,
      );

      await focus('rect');
      await triggerKeyEvent('rect', 'keydown', 'ArrowRight');
      await triggerKeyEvent('rect', 'keydown', 'Enter');
      await triggerKeyEvent('rect', 'keydown', 'ArrowRight');
      await triggerKeyEvent('rect', 'keydown', ' ');

      assert.ok(onSelect.calledTwice);
      assert.deepEqual(onSelect.getCall(0).args[0].datum, linearData[1]);
      assert.deepEqual(onSelect.getCall(1).args[0].datum, linearData[2]);
    });
  },
);
