/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { ScaleLinear, ScaleBand } from '#src/utils/scale.ts';
import { roundedRect } from '#src/utils/rounded-rect.ts';
import { HBars } from '#src/components.ts';
import stackH from '#src/helpers/stack-h.ts';

const getAttrs = (el: Element, ...attrs: string[]) =>
  attrs.map((attr) => el.getAttribute(attr));

const data = [
  { foo: 'A', bar: 1, barPrev: 0 },
  { foo: 'B', bar: 1, barPrev: 1 },
  { foo: 'C', bar: 2, barPrev: 1 },
  { foo: 'D', bar: 3, barPrev: 2 },
  { foo: 'E', bar: 5, barPrev: 3 },
  { foo: 'F', bar: 8, barPrev: 5 },
  { foo: 'G', bar: 13, barPrev: 8 },
];

const stackableData = [
  { foo: 'A', bar: 1, cat: 'a' },
  { foo: 'B', bar: 1, cat: 'a' },
  { foo: 'C', bar: 2, cat: 'a' },
  { foo: 'D', bar: 3, cat: 'a' },

  { foo: 'A', bar: 5, cat: 'b' },
  { foo: 'B', bar: 5, cat: 'b' },
  { foo: 'C', bar: 5, cat: 'b' },
  { foo: 'D', bar: 5, cat: 'b' },

  { foo: 'A', bar: 3, cat: 'c' },
  { foo: 'B', bar: 2, cat: 'c' },
  { foo: 'C', bar: 1, cat: 'c' },
  { foo: 'D', bar: 1, cat: 'c' },
];

module('Integration | Component | HBars', function (hooks) {
  setupRenderingTest(hooks);

  test('Given a dataset and x and x0 and y accessors and scales, renders rects', async function (assert) {
    const xScale = new ScaleLinear({ domain: '0..', range: '0..100' });
    const yScale = new ScaleBand({
      domain: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      range: '0..100',
      padding: 0.1,
    });

    await render(
      <template>
        <svg class="test-svg">
          <HBars
            @data={{data}}
            @x="bar"
            @x0={{0}}
            @y="foo"
            @height={{yScale.bandwidth}}
            @xScale={{xScale}}
            @yScale={{yScale}}
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
        '' + xScale.compute(d.bar),
        '' + yScale.compute(d.foo),
        '' + (xScale.compute(d.bar) - xScale.compute(0)),
        '' + yScale.bandwidth,
      ]),
    );
  });

  test('when a @color encoding is provided, data is automatically stacked', async function (assert) {
    const xScale = new ScaleLinear({ domain: '0..', range: '0..100' });
    const yScale = new ScaleBand({
      domain: ['A', 'B', 'C', 'D'],
      range: '0..100',
      padding: 0.1,
    });

    await render(
      <template>
        <svg class="test-svg">
          <HBars
            @data={{stackableData}}
            @x="bar"
            @y="foo"
            @color="cat"
            @height={{yScale.bandwidth}}
            @xScale={{xScale}}
            @yScale={{yScale}}
            @colorScale="reds"
          />
        </svg>
      </template>,
    );

    assert.dom('g g').exists({ count: 3 });
    assert.dom('g g rect.reds-3-1').exists({ count: 4 });
    assert.dom('g g rect.reds-3-2').exists({ count: 4 });
    assert.dom('g g rect.reds-3-3').exists({ count: 4 });
  });

  test('when @data is already stacked, a group of rects for each data series drawn', async function (assert) {
    const xScale = new ScaleLinear({ domain: '0..', range: '0..100' });
    const yScale = new ScaleBand({
      domain: ['A', 'B', 'C', 'D'],
      range: '0..100',
      padding: 0.1,
    });

    await render(
      <template>
        <svg class="test-svg">
          {{#let
            (stackH data=stackableData x="bar" y="foo" z="cat")
            as |stacked|
          }}
            <HBars
              @data={{stacked.data}}
              @height={{yScale.bandwidth}}
              @xScale={{xScale}}
              @yScale={{yScale}}
              @colorScale="reds"
            />
          {{/let}}
        </svg>
      </template>,
    );

    assert.dom('g g').exists({ count: 3 });
    assert.dom('g g rect.reds-3-1').exists({ count: 4 });
    assert.dom('g g rect.reds-3-2').exists({ count: 4 });
    assert.dom('g g rect.reds-3-3').exists({ count: 4 });
  });

  test('When @borderRadius is provided, paths of rounded rectangles are rendered instead of rects', async function (assert) {
    const xScale = new ScaleLinear({ domain: '0..', range: '0..100' });
    const yScale = new ScaleBand({
      domain: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      range: '0..100',
      padding: 0.1,
    });

    await render(
      <template>
        <svg class="test-svg">
          <HBars
            @data={{data}}
            @x="bar"
            @y="foo"
            @x0={{0}}
            @height={{yScale.bandwidth}}
            @xScale={{xScale}}
            @yScale={{yScale}}
            @borderRadius="5 8"
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
            x: xScale.compute(d.bar),
            y: yScale.compute(d.foo) ?? 0,
            height: yScale.bandwidth,
            width: xScale.compute(d.bar) - xScale.compute(0),
          },
          { topLeft: 5, topRight: 8, bottomRight: 5, bottomLeft: 8 },
          true,
        ),
      ),
    );
  });

  test('When @borderRadius is provided and data is stacked, visually top rects are half-rounded paths and visually bottom rects are half-rounded paths', async function (assert) {
    // By half-rounding the top rects and half-rounding the bottom rects, the complete slice of data is fully rounded
    const xScale = new ScaleLinear({ domain: '0..', range: '0..100' });
    const yScale = new ScaleBand({
      domain: ['A', 'B', 'C', 'D'],
      range: '0..100',
      padding: 0.1,
    });

    await render(
      <template>
        <svg class="test-svg">
          <HBars
            @data={{stackableData}}
            @x="bar"
            @y="foo"
            @color="cat"
            @height={{yScale.bandwidth}}
            @xScale={{xScale}}
            @yScale={{yScale}}
            @colorScale="reds"
            @borderRadius="5 8"
          />
        </svg>
      </template>,
    );

    assert.dom('g g').exists({ count: 3 });
    assert.dom('g g path.reds-3-1').exists({ count: 4 });
    assert.dom('g g rect.reds-3-2').exists({ count: 4 });
    assert.dom('g g path.reds-3-3').exists({ count: 4 });
    assert.dom('g g rect.reds-3-1').exists({ count: 0 });
    assert.dom('g g path.reds-3-2').exists({ count: 0 });
    assert.dom('g g rect.reds-3-3').exists({ count: 0 });
  });
});
