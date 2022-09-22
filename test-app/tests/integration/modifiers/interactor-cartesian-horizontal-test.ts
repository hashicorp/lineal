import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, triggerEvent, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import * as sinon from 'sinon';
import { ScaleLinear } from '@lineal-viz/lineal/scale';
import { Encoding } from '@lineal-viz/lineal/encoding';

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

const triggerMouseMove = async (
  element: string | SVGGraphicsElement,
  x: number,
  y: number
) => {
  const el: SVGGraphicsElement | null =
    element instanceof Element
      ? (element as SVGGraphicsElement)
      : find(element);

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
  y: number
) => {
  const el: SVGGraphicsElement | null =
    element instanceof Element
      ? (element as SVGGraphicsElement)
      : find(element);

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
      const onSeek = sinon.spy();

      this.setProperties({ scale, onSeek, data: linearData });

      await render(hbs`
        <svg>
          <rect
            x='0' y='0' width='100' height='10'
            {{interactor-cartesian-horizontal data=this.data xScale=this.scale x='x' y='y' onSeek=this.onSeek}}
          ></rect>
        </svg>
      `);

      await triggerMouseMove('rect', 50, 25);

      assert.ok(onSeek.calledOnce);
      assert.deepEqual(
        onSeek.getCall(0).args[0].datum.datum,
        linearData.find((d) => d.x === scale.d3Scale.invert(50))
      );
    });

    test('The click event calls the onSelect handler with the datum under the mouse', async function (assert) {
      const scale = new ScaleLinear({ domain: [0, 10], range: [0, 100] });
      const onSelect = sinon.spy();

      this.setProperties({ scale, onSelect, data: linearData });

      await render(hbs`
        <svg>
          <rect
            x='0' y='0' width='100' height='10'
            {{interactor-cartesian-horizontal data=this.data xScale=this.scale x='x' y='y' onSelect=this.onSelect}}
          ></rect>
        </svg>
      `);

      await triggerClick('rect', 53, 25);

      assert.ok(onSelect.calledOnce);
      assert.deepEqual(
        onSelect.getCall(0).args[0].datum,
        linearData.find((d) => d.x === scale.d3Scale.invert(50))
      );
    });

    test('The mouseleave event calls the onSeek and onSelect handlers with null', async function (assert) {
      const scale = new ScaleLinear({ domain: [0, 10], range: [0, 100] });
      const onSelect = sinon.spy();
      const onSeek = sinon.spy();

      this.setProperties({ scale, onSeek, onSelect, data: linearData });

      await render(hbs`
        <svg>
          <rect
            x='0' y='0' width='100' height='10'
            {{interactor-cartesian-horizontal
              data=this.data
              xScale=this.scale
              x='x'
              y='y'
              onSelect=this.onSelect
              onSeek=this.onSeek}}
          ></rect>
        </svg>
      `);

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
      this.setProperties({ scale, data: linearData });

      await render(hbs`
        <svg>
          <rect
            x='0' y='0' width='100' height='10'
            {{interactor-cartesian-horizontal data=this.data xScale=this.scale x='x' y='y'}}
          ></rect>
        </svg>
      `);

      await triggerMouseMove('rect', 53, 25);
      await triggerClick('rect', 53, 25);
      await triggerEvent('rect', 'mouseleave');

      assert.ok(true);
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
      const onSelect = sinon.spy();
      const onSeek = sinon.spy();

      this.setProperties({ scale, onSeek, onSelect, data: linearData });

      await render(hbs`
        <svg>
          <rect
            x='0' y='0' width='100' height='10'
            {{interactor-cartesian-horizontal
              data=this.data
              xScale=this.scale
              x='x'
              y=(array 'a' 'b' 'c')
              onSelect=this.onSelect
              onSeek=this.onSeek}}
          ></rect>
        </svg>
      `);

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
        ]
      );
      assert.deepEqual(
        onSeek
          .getCall(0)
          .args[0].data.map((d: { encoding: Encoding }) => d.encoding.field),
        ['a', 'b', 'c']
      );
    });

    test('when multiple y encodings are provided, the data provided to onSeek includes the closest datum per encoding within the distanceThreshold', async function (assert) {
      const linearData = [
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

      const scale = new ScaleLinear({ domain: [0, 10], range: [0, 100] });
      const onSeek = sinon.spy();

      this.setProperties({ scale, onSeek, data: linearData });

      await render(hbs`
        <svg>
          <rect
            x='0' y='0' width='100' height='10'
            {{interactor-cartesian-horizontal
              data=this.data
              xScale=this.scale
              x='x'
              y=(array 'a' 'b' 'c')
              distanceThreshold=10
              onSeek=this.onSeek}}
          ></rect>
        </svg>
      `);

      await triggerMouseMove('rect', 50, 25);
      await triggerClick('rect', 50, 25);

      assert.deepEqual(onSeek.getCall(0).args[0].datum.datum, { x: 5, a: 8 });
      assert.deepEqual(
        onSeek.getCall(0).args[0].data.map((d: { datum: unknown }) => d.datum),
        [
          { x: 5, a: 8 },
          { x: 5.2, c: 5.2 },
        ]
      );
      assert.deepEqual(
        onSeek
          .getCall(0)
          .args[0].data.map((d: { encoding: Encoding }) => d.encoding.field),
        ['a', 'c']
      );
    });
  }
);
