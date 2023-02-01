/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { ScaleLinear } from '@lineal-viz/lineal/scale';

interface Attrs {
  [property: string]: string | null;
}

const attrs = (el: Element, ...attributes: string[]): Attrs =>
  attributes.reduce((obj: Attrs, attr: string) => {
    obj[attr] = el.getAttribute(attr);
    return obj;
  }, {});

module('Integration | Component | Lineal::Gridlines', function (hooks) {
  setupRenderingTest(hooks);

  test('Given a scale, a direction, and a length, renders gridlines', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    this.setProperties({ scale });

    await render(hbs`
      <svg>
        <Lineal::Gridlines
          @scale={{this.scale}}
          @direction="horizontal"
          @length={{100}}
          @offset={{0}} />
      </svg>
    `);

    assert.deepEqual(
      findAll('.gridlines line').map((el) => attrs(el, 'x1', 'x2', 'y1', 'y2')),
      scale.d3Scale.ticks().map((t: any) => ({
        x1: '0',
        x2: '100',
        y1: '' + scale.compute(t),
        y2: '' + scale.compute(t),
      }))
    );
  });

  test('The lineValues arg is used to manually specify gridline positions', async function (assert) {
    const scale = new ScaleLinear({ range: '0..100', domain: '0..10' });
    const lineValues = [0, 10, 20, 30, 50, 80];
    this.setProperties({ scale, lineValues });

    await render(hbs`
      <svg>
        <Lineal::Gridlines
          @scale={{this.scale}}
          @lineValues={{this.lineValues}}
          @direction="vertical"
          @length={{100}}
          @offset={{0}} />
      </svg>
    `);

    assert.deepEqual(
      findAll('.gridlines line').map((el) => attrs(el, 'x1', 'x2', 'y1', 'y2')),
      lineValues.map((t: any) => ({
        x1: '' + scale.compute(t),
        x2: '' + scale.compute(t),
        y1: '0',
        y2: '100',
      }))
    );
  });
});
