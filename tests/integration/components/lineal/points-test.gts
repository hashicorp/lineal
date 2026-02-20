/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { spy } from 'sinon';
import { ScaleLinear } from '#src/utils/scale.ts';
import { Points } from '#src/components.ts';
import scaleLinearHelper from '#src/helpers/scale-linear.ts';
import spyHelper from '#tests/helpers/spy.ts';

import type { PointDatum } from '#src/components/points.gts';

interface Datum {
  x: number;
  y: number;
  group: string;
}

const data: Datum[] = [
  { x: 0, y: 0, group: 'a' },
  { x: 1, y: 5, group: 'a' },
  { x: 2, y: 10, group: 'b' },
  { x: 3, y: 20, group: 'b' },
  { x: 4, y: 40, group: 'a' },
  { x: 5, y: 80, group: 'c' },
  { x: 6, y: 40, group: 'd' },
  { x: 7, y: 20, group: 'c' },
  { x: 8, y: 10, group: 'd' },
  { x: 9, y: 5, group: 'e' },
];

module('Integration | Component | Points', function (hooks) {
  setupRenderingTest(hooks);

  test('Given a dataset and x, y, and size accessors and scales, renders circles', async function (assert) {
    const xScale = new ScaleLinear({ domain: '0..10', range: '0..100' });
    const yScale = new ScaleLinear({ domain: '0..10', range: '0..50' });

    await render(
      <template>
        <svg class="test-svg">
          <Points
            @data={{data}}
            @x="x"
            @y="y"
            @size={{5}}
            @xScale={{xScale}}
            @yScale={{yScale}}
          />
        </svg>
      </template>,
    );

    assert.strictEqual(findAll('circle').length, data.length);
    assert.deepEqual(
      findAll('circle').map((el: Element) => [
        el.getAttribute('cx'),
        el.getAttribute('cy'),
      ]),
      data.map((d) => ['' + xScale.compute(d.x), '' + yScale.compute(d.y)]),
    );
  });

  test('Encodings can use functions as accessors', async function (assert) {
    const x = (d: Datum) => d.x + 5;
    const y = (d: Datum) => d.y * d.x;
    const xScale = new ScaleLinear({ domain: '0..10', range: '0..100' });
    const yScale = new ScaleLinear({ domain: '0..10', range: '0..50' });

    await render(
      <template>
        <svg class="test-svg">
          <Points
            @data={{data}}
            @x={{x}}
            @y={{y}}
            @size={{5}}
            @xScale={{xScale}}
            @yScale={{yScale}}
          />
        </svg>
      </template>,
    );

    assert.strictEqual(findAll('circle').length, data.length);
    assert.deepEqual(
      findAll('circle').map((el: Element) => [
        el.getAttribute('cx'),
        el.getAttribute('cy'),
      ]),
      data.map((d) => ['' + xScale.compute(x(d)), '' + yScale.compute(y(d))]),
    );
  });

  test('When the domain provided on a scale is unqualified, Points qualifies it using the provided dataset and encoding', async function (assert) {
    const xScale = new ScaleLinear({ domain: '..', range: '0..100' });
    const yScale = new ScaleLinear({ domain: '-10..', range: '0..50' });

    await render(
      <template>
        <svg class="test-svg">
          <Points
            @data={{data}}
            @x="x"
            @y="y"
            @size={{5}}
            @xScale={{xScale}}
            @yScale={{yScale}}
          />
        </svg>
      </template>,
    );

    assert.deepEqual(xScale.domain.bounds, [0, 9]);
    assert.deepEqual(yScale.domain.bounds, [-10, 80]);
  });

  test('When a color encoding is not provided, no color related properties are applied to the circle elements', async function (assert) {
    await render(
      <template>
        <svg class="test-svg">
          <Points
            @data={{data}}
            @x="x"
            @y="y"
            @size={{5}}
            @xScale={{scaleLinearHelper range="0..100"}}
            @yScale={{scaleLinearHelper range="0..100"}}
          />
        </svg>
      </template>,
    );

    findAll('circle').forEach((el: Element) => {
      assert.dom(el).doesNotHaveAttribute('class');
      assert.dom(el).doesNotHaveAttribute('fill');
    });
  });

  test('When @colorScale is a string, a ScaleOrdinal with a CSSRange is automatically made', async function (assert) {
    await render(
      <template>
        <svg class="test-svg">
          <Points
            @data={{data}}
            @x="x"
            @y="y"
            @size={{5}}
            @color="group"
            @xScale={{scaleLinearHelper range="0..100"}}
            @yScale={{scaleLinearHelper range="0..100"}}
            @colorScale="ordinal"
          />
        </svg>
      </template>,
    );

    const groupClassOrder = Array.from(new Set(data.map((d) => d.group)));

    findAll('circle').forEach((el: Element, index: number) => {
      const group = groupClassOrder.indexOf(data[index]?.group ?? '');
      assert.dom(el).hasClass('ordinal');
      assert.dom(el).hasClass(`ordinal-${group + 1}`);
      assert.dom(el).hasClass(`ordinal-${groupClassOrder.length}-${group + 1}`);
    });
  });

  test('The component yields structured arc data', async function (assert) {
    const spyFn = spy();
    const xScale = new ScaleLinear({ domain: '..', range: '0..100' });
    const yScale = new ScaleLinear({ domain: '-10..', range: '0..50' });

    await render(
      <template>
        <svg class="test-svg">
          <Points
            @data={{data}}
            @x="x"
            @y="y"
            @size={{5}}
            @color="group"
            @xScale={{xScale}}
            @yScale={{yScale}}
            @colorScale="ordinal"
            as |points|
          >
            {{#each points as |p|}}
              {{spyHelper spyFn p}}
            {{/each}}
          </Points>
        </svg>
      </template>,
    );

    assert.strictEqual(spyFn.callCount, data.length);
    assert.strictEqual(findAll('circle').length, 0);

    for (const t of spyFn.getCalls()) {
      const point = t.args[0] as PointDatum;
      assert.hasProperties(point, ['x', 'y', 'size', 'cssClass', 'datum']);
      assert.lacksProperties(point, ['fill']);
    }
  });

  test('When @renderCircles is true, the component renders circles for points even when using the block form', async function (assert) {
    const spyFn = spy();
    const xScale = new ScaleLinear({ domain: '..', range: '0..100' });
    const yScale = new ScaleLinear({ domain: '-10..', range: '0..50' });

    await render(
      <template>
        <svg class="test-svg">
          <Points
            @renderCircles={{true}}
            @data={{data}}
            @x="x"
            @y="y"
            @size={{5}}
            @color="group"
            @xScale={{xScale}}
            @yScale={{yScale}}
            @colorScale="ordinal"
            as |points|
          >
            {{#each points as |p|}}
              {{spyHelper spyFn p}}
            {{/each}}
          </Points>
        </svg>
      </template>,
    );

    assert.strictEqual(spyFn.callCount, data.length);
    assert.strictEqual(findAll('circle').length, data.length);

    for (const t of spyFn.getCalls()) {
      const point = t.args[0] as PointDatum;
      assert.hasProperties(point, ['x', 'y', 'size', 'cssClass', 'datum']);
      assert.lacksProperties(point, ['fill']);
    }
  });
});
