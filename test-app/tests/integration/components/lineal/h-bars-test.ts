/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { ScaleLinear, ScaleBand } from '@lineal-viz/lineal/scale';

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

module('Integration | Component | Lineal::HBars', function (hooks) {
  setupRenderingTest(hooks);

  test('Given a dataset and x and x0 and y accessors and scales, renders rects', async function (assert) {
    const xScale = new ScaleLinear({ domain: '0..', range: '0..100' });
    const yScale = new ScaleBand({
      domain: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      range: '0..100',
      padding: 0.1,
    });

    this.setProperties({ data, xScale, yScale });

    await render(hbs`
      <svg class="test-svg">
        <Lineal::HBars
          @data={{this.data}}
          @x="bar"
          @x0={{0}}
          @y="foo"
          @height={{this.yScale.bandwidth}}
          @xScale={{this.xScale}}
          @yScale={{this.yScale}}
        />
      </svg>
    `);

    assert.strictEqual(findAll('rect').length, data.length);
    assert.deepEqual(
      findAll('rect').map((el: Element) =>
        getAttrs(el, 'x', 'y', 'width', 'height')
      ),
      data.map((d) => [
        '' + xScale.compute(d.bar),
        '' + yScale.compute(d.foo),
        '' + (xScale.compute(d.bar) - xScale.compute(0)),
        '' + yScale.bandwidth,
      ])
    );
  });

  test('when a @color encoding is provided, data is automatically stacked', async function (assert) {
    const xScale = new ScaleLinear({ domain: '0..', range: '0..100' });
    const yScale = new ScaleBand({
      domain: ['A', 'B', 'C', 'D'],
      range: '0..100',
      padding: 0.1,
    });

    this.setProperties({ stackableData, xScale, yScale });

    await render(hbs`
      <svg class="test-svg">
        <Lineal::HBars
          @data={{this.stackableData}}
          @x="bar"
          @y="foo"
          @color="cat"
          @height={{this.yScale.bandwidth}}
          @xScale={{this.xScale}}
          @yScale={{this.yScale}}
          @colorScale="reds"
        />
      </svg>
    `);

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

    this.setProperties({ stackableData, xScale, yScale });

    await render(hbs`
      <svg class="test-svg">
        {{#let (stack-h data=this.stackableData x='bar' y='foo' z='cat') as |stacked|}}
          <Lineal::HBars
            @data={{stacked.data}}
            @height={{this.yScale.bandwidth}}
            @xScale={{this.xScale}}
            @yScale={{this.yScale}}
            @colorScale="reds"
          />
        {{/let}}
      </svg>
    `);

    assert.dom('g g').exists({ count: 3 });
    assert.dom('g g rect.reds-3-1').exists({ count: 4 });
    assert.dom('g g rect.reds-3-2').exists({ count: 4 });
    assert.dom('g g rect.reds-3-3').exists({ count: 4 });
  });
});
