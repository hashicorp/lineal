/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { pie, arc } from 'd3-shape';
import { spy } from 'sinon';
import { ScaleOrdinal } from '#src/scale.ts';
import { Arcs } from '#src/components.ts';

import type { ArcDatum } from '#src/components/arcs.gts';
import spyHelper from '#tests/helpers/spy.ts';

interface Datum {
  value: number;
}

const data = [{ value: 5 }, { value: 10 }, { value: 15 }, { value: 20 }];

module('Integration | Component | Arcs', function (hooks) {
  setupRenderingTest(hooks);

  test('Given a dataset, theta and color accessors, and a colorScale, renders a group of paths', async function (assert) {
    const colors = ['red', 'blue', 'yellow', 'green'];
    const scale = new ScaleOrdinal({
      range: colors,
    });

    await render(
      <template>
        <svg class="test-svg">
          <Arcs @data={{data}} @colorScale={{scale}} @theta="value" />
        </svg>
      </template>,
    );

    const paths = findAll('path');
    assert.strictEqual(paths.length, data.length);

    const pieGenerator = pie()
      .startAngle(0)
      .endAngle(Math.PI * 2)
      .padAngle(0)
      .value((d: any) => d.value)
      .sortValues(null);

    // @ts-expect-error Argument of type
    const arcs = pieGenerator(data);
    // These defaults come from Arc
    const arcGenerator = arc().innerRadius(0).outerRadius(100);

    paths.forEach((slice, index) => {
      assert.dom(slice).hasAttribute('fill', colors[index] || '');

      const arcData = arcs[index];
      // @ts-expect-error Argument of type
      assert.dom(slice).hasAttribute('d', arcGenerator(arcData));
    });
  });

  test('Encodings can use functions as accessors', async function (assert) {
    const theta = (d: Datum) => (d.value > 10 ? d.value / 2 : d.value);

    await render(
      <template>
        <svg class="test-svg">
          <Arcs @data={{data}} @theta={{theta}} />
        </svg>
      </template>,
    );

    const paths = findAll('path');
    assert.strictEqual(paths.length, data.length);

    const pieGenerator = pie()
      .startAngle(0)
      .endAngle(Math.PI * 2)
      .padAngle(0)
      .value((d: any) => d)
      .sortValues(null);

    const arcs = pieGenerator([5, 10, 7.5, 10]);
    // These defaults come from Arc
    const arcGenerator = arc().innerRadius(0).outerRadius(100);

    paths.forEach((slice, index) => {
      const arcData = arcs[index];
      // @ts-expect-error Argument of type
      assert.dom(slice).hasAttribute('d', arcGenerator(arcData));
    });
  });

  test('When @colorScale is a string, a ScaleOrdinal with a CSSRange is automatically made', async function (assert) {
    await render(
      <template>
        <svg class="test-svg">
          <Arcs @data={{data}} @colorScale="reds" @theta="value" />
        </svg>
      </template>,
    );

    const paths = findAll('path');
    assert.strictEqual(paths.length, data.length);

    paths.forEach((slice, index) => {
      assert.dom(slice).hasClass('reds');
      assert.dom(slice).hasClass(`reds-${index + 1}`);
      assert.dom(slice).hasClass(`reds-${data.length}-${index + 1}`);
    });
  });

  test('The component yields structured arc data', async function (assert) {
    const spyFn = spy();
    const colors = ['red', 'blue', 'yellow', 'green'];
    const scale = new ScaleOrdinal({
      range: colors,
    });

    await render(
      <template>
        <svg class="test-svg">
          <Arcs @data={{data}} @colorScale={{scale}} @theta="value" as |arcs|>
            {{#each arcs as |arc|}}
              {{spyHelper spyFn arc}}
            {{/each}}
          </Arcs>
        </svg>
      </template>,
    );

    assert.strictEqual(spyFn.callCount, data.length);

    for (const t of spyFn.getCalls()) {
      const arc = t.args[0] as ArcDatum;
      assert.hasProperties(arc, [
        'fill',
        'data',
        'value',
        'index',
        'startAngle',
        'endAngle',
        'padAngle',
      ]);

      assert.lacksProperties(arc, ['cssClass']);
    }
  });

  test('When the provided color scale uses a CSSRange for the range, the arc data provides cssClass instead of fill', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        <svg class="test-svg">
          <Arcs @data={{data}} @colorScale="reds" @theta="value" as |arcs|>
            {{#each arcs as |arc|}}
              {{spyHelper spyFn arc}}
            {{/each}}
          </Arcs>
        </svg>
      </template>,
    );

    assert.strictEqual(spyFn.callCount, data.length);

    for (const t of spyFn.getCalls()) {
      const arc = t.args[0] as ArcDatum;
      assert.lacksProperties(arc, ['fill']);
    }
  });
});
