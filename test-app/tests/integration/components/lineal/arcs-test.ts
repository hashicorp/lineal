import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { pie, arc } from 'd3-shape';
import * as sinon from 'sinon';
import { ScaleOrdinal } from '@lineal-viz/lineal/scale';
import { ArcDatum } from '@lineal-viz/lineal/components/lineal/arcs/index';

interface Datum {
  value: number;
}

const data = [{ value: 5 }, { value: 10 }, { value: 15 }, { value: 20 }];

module('Integration | Component | Lineal::Arcs', function (hooks) {
  setupRenderingTest(hooks);

  test('Given a dataset, theta and color accessors, and a colorScale, renders a group of paths', async function (assert) {
    const colors = ['red', 'blue', 'yellow', 'green'];
    const scale = new ScaleOrdinal({
      range: colors,
    });

    this.setProperties({ data, scale });

    await render(hbs`
      <svg class="test-svg">
        <Lineal::Arcs
          @data={{this.data}}
          @colorScale={{this.scale}}
          @theta="value"
        />
      </svg>
    `);

    const paths = findAll('path');
    assert.strictEqual(paths.length, data.length);

    const pieGenerator = pie()
      .startAngle(0)
      .endAngle(Math.PI * 2)
      .padAngle(0)
      .value((d: any) => d.value)
      .sortValues(null);

    // @ts-ignore
    const arcs = pieGenerator(data);
    // These defaults come from Lineal::Arc
    const arcGenerator = arc().innerRadius(0).outerRadius(100);

    paths.forEach((slice, index) => {
      assert.dom(slice).hasAttribute('fill', colors[index] || '');

      const arcData = arcs[index];
      // @ts-ignore -- This works and is normal d3 code, type definitions are just lacking
      assert.dom(slice).hasAttribute('d', arcGenerator(arcData));
    });
  });

  test('Encodings can use functions as accessors', async function (assert) {
    const theta = (d: Datum) => (d.value > 10 ? d.value / 2 : d.value);
    this.setProperties({ data, theta });

    await render(hbs`
      <svg class="test-svg">
        <Lineal::Arcs
          @data={{this.data}}
          @theta={{this.theta}}
        />
      </svg>
    `);

    const paths = findAll('path');
    assert.strictEqual(paths.length, data.length);

    const pieGenerator = pie()
      .startAngle(0)
      .endAngle(Math.PI * 2)
      .padAngle(0)
      .value((d: any) => d)
      .sortValues(null);

    // @ts-ignore
    const arcs = pieGenerator([5, 10, 7.5, 10]);
    // These defaults come from Lineal::Arc
    const arcGenerator = arc().innerRadius(0).outerRadius(100);

    paths.forEach((slice, index) => {
      const arcData = arcs[index];
      // @ts-ignore -- This works and is normal d3 code, type definitions are just lacking
      assert.dom(slice).hasAttribute('d', arcGenerator(arcData));
    });
  });

  test('When @colorScale is a string, a ScaleOrdinal with a CSSRange is automatically made', async function (assert) {
    this.setProperties({ data });

    await render(hbs`
      <svg class="test-svg">
        <Lineal::Arcs
          @data={{this.data}}
          @colorScale="reds"
          @theta="value"
        />
      </svg>
    `);

    const paths = findAll('path');
    assert.strictEqual(paths.length, data.length);

    const pieGenerator = pie()
      .startAngle(0)
      .endAngle(Math.PI * 2)
      .padAngle(0)
      .value((d: any) => d.value)
      .sortValues(null);

    paths.forEach((slice, index) => {
      assert.dom(slice).hasClass('reds');
      assert.dom(slice).hasClass(`reds-${index + 1}`);
      assert.dom(slice).hasClass(`reds-${data.length}-${index + 1}`);
    });
  });

  test('The component yields structured arc data', async function (assert) {
    const spy = sinon.spy();
    const colors = ['red', 'blue', 'yellow', 'green'];
    const scale = new ScaleOrdinal({
      range: colors,
    });

    this.setProperties({ data, scale, spy });

    await render(hbs`
      <svg class="test-svg">
        <Lineal::Arcs
          @data={{this.data}}
          @colorScale={{this.scale}}
          @theta="value"
        as |arcs|>
        {{#each arcs as |arc|}}
          {{this.spy arc}}
        {{/each}}
      </Lineal::Arcs>
      </svg>
    `);

    assert.strictEqual(spy.callCount, data.length);

    for (let t of spy.getCalls()) {
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
    const spy = sinon.spy();
    this.setProperties({ data, spy });

    await render(hbs`
      <svg class="test-svg">
        <Lineal::Arcs
          @data={{this.data}}
          @colorScale="reds"
          @theta="value"
        as |arcs|>
        {{#each arcs as |arc|}}
          {{this.spy arc}}
        {{/each}}
      </Lineal::Arcs>
      </svg>
    `);

    assert.strictEqual(spy.callCount, data.length);

    for (let t of spy.getCalls()) {
      const arc = t.args[0] as ArcDatum;
      assert.lacksProperties(arc, ['fill']);
    }
  });
});
