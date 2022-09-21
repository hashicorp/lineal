import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  find,
  triggerEvent,
  getRootElement,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import * as sinon from 'sinon';
import { ScaleLinear } from '@lineal-viz/lineal/scale';

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

module(
  'Integration | Modifier | interactor-caresian-horizontal',
  function (hooks) {
    setupRenderingTest(hooks);

    test('The mousemove event calls the onSeek handler with the data under the mouse', async function (assert) {
      const scale = new ScaleLinear({ domain: [0, 10], range: [0, 100] });
      const onSeek = sinon.spy();
      const data = [
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

      this.setProperties({ scale, data, onSeek });

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
        data.find((d) => d.x === scale.d3Scale.invert(50))
      );
    });

    test('The click event  calls the onSelect handler with the datum under the mouse', async function (assert) {});

    test('The mouseleave event calls the onSeek and onSelect handlers with null', async function (assert) {});

    test('when the modifier is used without providing onSeek or onSelect handlers, the modifier performs gracefully', async function (assert) {});

    test('when multiple y encodings are provided, the datum provided to onSeek and onSelect is the one closest to the cursor', async function (assert) {});

    test('when multiple y encodings are provided, the data provided to onSeek includes the closest datum per encoding within the distanceThreshold', async function (assert) {});
  }
);
