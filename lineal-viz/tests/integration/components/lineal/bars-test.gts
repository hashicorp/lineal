/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { ScaleLinear, ScaleBand } from '#src/scale.ts';
import { roundedRect } from '#src/utils/rounded-rect.ts';
import { Bars } from '#src/components.ts';

const getAttrs = (el: Element, ...attrs: string[]) =>
  attrs.map((attr) => el.getAttribute(attr));

const data = [
  { cat: 'A', value: 10 },
  { cat: 'B', value: 20 },
  { cat: 'C', value: 50 },
  { cat: 'D', value: 15 },
];

module('Integration | Component | Bars', function (hooks) {
  setupRenderingTest(hooks);

  test('Given a dataset and x, y, height, and width accessors and scales, renders bars', async function (assert) {
    const xScale = new ScaleBand({
      domain: ['A', 'B', 'C', 'D'],
      range: '0..100',
      padding: 0.1,
    });
    const yScale = new ScaleLinear({ domain: '0..', range: '100..0' });
    const heightScale = new ScaleLinear({ domain: '0..', range: '0..100' });

    await render(
      <template>
        <svg class="test-svg">
          <Bars
            @data={{data}}
            @x="cat"
            @y="value"
            @height="value"
            @width={{xScale.bandwidth}}
            @xScale={{xScale}}
            @yScale={{yScale}}
            @heightScale={{heightScale}}
          />
        </svg>
      </template>,
    );

    assert.strictEqual(findAll('rect').length, data.length);
    assert.deepEqual(
      findAll('rect').map((el: Element) =>
        getAttrs(el, 'x', 'y', 'width', 'height'),
      ),
      data.map((d) => [
        '' + xScale.compute(d.cat),
        '' + yScale.compute(d.value),
        '' + xScale.bandwidth,
        '' + heightScale.compute(d.value),
      ]),
    );
  });

  test('When the domain provided on a scale is unqualified, Bars qualifies it using the provided dataset and encoding', async function (assert) {
    const xScale = new ScaleBand({
      domain: ['A', 'B', 'C', 'D'],
      range: '0..100',
      padding: 0.1,
    });
    const yScale = new ScaleLinear({ domain: '0..', range: '100..0' });
    const heightScale = new ScaleLinear({ domain: '0..', range: '0..100' });

    await render(
      <template>
        <svg class="test-svg">
          <Bars
            @data={{data}}
            @x="cat"
            @y="value"
            @height="value"
            @width={{xScale.bandwidth}}
            @xScale={{xScale}}
            @yScale={{yScale}}
            @heightScale={{heightScale}}
          />
        </svg>
      </template>,
    );

    assert.deepEqual(yScale.domain.bounds, [0, 50]);
    assert.deepEqual(heightScale.domain.bounds, [0, 50]);
  });

  test('When @borderRadius is provided, paths of rounded rectangles are rendered instead of rects', async function (assert) {
    const xScale = new ScaleBand({
      domain: ['A', 'B', 'C', 'D'],
      range: '0..100',
      padding: 0.1,
    });
    const yScale = new ScaleLinear({ domain: '0..', range: '100..0' });
    const heightScale = new ScaleLinear({ domain: '0..', range: '0..100' });

    await render(
      <template>
        <svg class="test-svg">
          <Bars
            @data={{data}}
            @x="cat"
            @y="value"
            @height="value"
            @width={{xScale.bandwidth}}
            @xScale={{xScale}}
            @yScale={{yScale}}
            @heightScale={{heightScale}}
            @borderRadius="5 5 0 0"
          />
        </svg>
      </template>,
    );

    assert.strictEqual(findAll('path').length, data.length);
    assert.deepEqual(
      findAll('path').map((el: Element) => el.getAttribute('d')),
      data.map((d) =>
        roundedRect(
          {
            x: xScale.compute(d.cat) ?? 0,
            y: yScale.compute(d.value),
            width: xScale.bandwidth,
            height: heightScale.compute(d.value),
          },
          { topLeft: 5, topRight: 5, bottomRight: 0, bottomLeft: 0 },
        ),
      ),
    );
  });
});
