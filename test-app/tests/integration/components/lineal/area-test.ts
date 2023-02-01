/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { area, curveStep, curveCardinal } from 'd3-shape';
import { scaleLinear } from 'd3-scale';

interface Datum {
  foo: number;
  bar: number;
  barPrev: number;
}

interface NullishDatum {
  foo?: number | null;
  bar?: number | null;
  barPrev?: number | null;
}

const data = [
  { foo: 1, bar: 1, barPrev: 0 },
  { foo: 2, bar: 1, barPrev: 1 },
  { foo: 3, bar: 2, barPrev: 1 },
  { foo: 4, bar: 3, barPrev: 2 },
  { foo: 5, bar: 5, barPrev: 3 },
  { foo: 6, bar: 8, barPrev: 5 },
  { foo: 7, bar: 13, barPrev: 8 },
];

module('Integration | Component | Lineal::Area', function (hooks) {
  setupRenderingTest(hooks);

  test('Given a dataset and x and y an y0 accessors and scales, renders a path', async function (assert) {
    this.setProperties({ data });

    await render(hbs`
      <svg>
      <Lineal::Area
        @data={{this.data}}
        @x="foo"
        @y="bar"
        @y0="barPrev"
        @xScale={{scale-linear range='0..100' domain='0..10'}}
        @yScale={{scale-linear range='50..0' domain='0..10'}}
      />
      </svg>
    `);

    const xScale = scaleLinear([0, 10], [0, 100]);
    const yScale = scaleLinear([0, 10], [50, 0]);
    const areaGenerator = area<Datum>()
      .x((d) => xScale(d.foo))
      .y0((d) => yScale(d.barPrev))
      .y1((d) => yScale(d.bar));
    assert.dom('path').hasAttribute('d', areaGenerator(data) as string);
  });

  test('Encodings can use functions as accessors', async function (assert) {
    const x = (d: Datum) => d.foo + 5;
    const y = (d: Datum) => d.foo * d.bar;

    this.setProperties({ data, x, y });

    await render(hbs`
      <Lineal::Area
        @data={{this.data}}
        @x={{this.x}}
        @y={{this.y}}
        @y0={{0}}
        @xScale={{scale-linear range='0..100' domain='0..10'}}
        @yScale={{scale-linear range='0..50' domain='0..10'}}
      />
    `);

    const xScale = scaleLinear([0, 10], [0, 100]);
    const yScale = scaleLinear([0, 10], [0, 50]);
    const areaGenerator = area<Datum>()
      .x((d) => xScale(x(d)))
      .y0(0)
      .y1((d) => yScale(y(d)));
    assert.dom('path').hasAttribute('d', areaGenerator(data) as string);
  });

  test('The @curve arg sets the curve formula for the area', async function (assert) {
    this.setProperties({ data });

    await render(hbs`
      <Lineal::Area
        @data={{this.data}}
        @x="foo"
        @y="bar"
        @y0={{0}}
        @xScale={{scale-linear range='0..100' domain='0..10'}}
        @yScale={{scale-linear range='0..50' domain='0..10'}}
        @curve="step"
      />
    `);

    const xScale = scaleLinear([0, 10], [0, 100]);
    const yScale = scaleLinear([0, 10], [0, 50]);
    const areaGenerator = area<Datum>()
      .curve(curveStep)
      .x((d) => xScale(d.foo))
      .y0(0)
      .y1((d) => yScale(d.bar));
    assert.dom('path').hasAttribute('d', areaGenerator(data) as string);
  });

  test('When the curve formula accepts additional arguments, they can be provided to the @curve arg in the form of a hash', async function (assert) {
    this.setProperties({ data });

    await render(hbs`
      <Lineal::Area
        @data={{this.data}}
        @x="foo"
        @y="bar"
        @y0={{0}}
        @xScale={{scale-linear range='0..100' domain='0..10'}}
        @yScale={{scale-linear range='0..50' domain='0..10'}}
        @curve={{hash name="cardinal"  tension=0.5}}
      />
    `);

    const xScale = scaleLinear([0, 10], [0, 100]);
    const yScale = scaleLinear([0, 10], [0, 50]);
    const areaGenerator = area<Datum>()
      .curve(curveCardinal.tension(0.5))
      .x((d) => xScale(d.foo))
      .y0(0)
      .y1((d) => yScale(d.bar));
    assert.dom('path').hasAttribute('d', areaGenerator(data) as string);
  });

  test('When the domain provided on a scale is unqualified, Line qualifies it using the provided dataset and encoding', async function (assert) {
    this.setProperties({ data });

    await render(hbs`
      <Lineal::Area
        @data={{this.data}}
        @x="foo"
        @y="bar"
        @y0={{0}}
        @xScale={{scale-linear range='0..100' domain='0..'}}
        @yScale={{scale-linear range='0..50' domain='0..'}}
      />
    `);

    const xScale = scaleLinear(
      [0, Math.max(...data.map((d) => d.foo))],
      [0, 100]
    );
    const yScale = scaleLinear(
      [0, Math.max(...data.map((d) => d.bar))],
      [0, 50]
    );
    const areaGenerator = area<Datum>()
      .x((d) => xScale(d.foo))
      .y0(0)
      .y1((d) => yScale(d.bar));
    assert.dom('path').hasAttribute('d', areaGenerator(data) as string);
  });

  test('By default, the area generator uses null value checking to determine defined-ness', async function (assert) {
    const dataWithNulls = [
      { foo: undefined, bar: 1 },
      { foo: 2, bar: null },
      { foo: 3, bar: 2 },
      { foo: null, bar: null },
      { foo: 5, bar: 5 },
      { foo: undefined },
      { foo: 7, bar: 13 },
    ];
    this.setProperties({ data: dataWithNulls });

    await render(hbs`
      <Lineal::Area
        @data={{this.data}}
        @x="foo"
        @y="bar"
        @y0={{0}}
        @xScale={{scale-linear range='0..100' domain='0..10'}}
        @yScale={{scale-linear range='0..50' domain='0..10'}}
      />
    `);

    const xScale = scaleLinear([0, 10], [0, 100]);
    const yScale = scaleLinear([0, 10], [0, 50]);
    const areaGenerator = area<NullishDatum>()
      .defined((d) => d.foo != null && d.bar != null)
      .x((d) => xScale(d.foo ?? 0))
      .y0(0)
      .y1((d) => yScale(d.bar ?? 0));
    assert
      .dom('path')
      .hasAttribute('d', areaGenerator(dataWithNulls) as string);
  });

  test('A function can be provided to the @defined arg to customize the defined-ness behavior', async function (assert) {
    const defined = (d: Datum) => d.bar % 2 !== 0;
    this.setProperties({ data, defined });

    await render(hbs`
      <Lineal::Area
        @data={{this.data}}
        @x="foo"
        @y="bar"
        @y0={{0}}
        @xScale={{scale-linear range='0..100' domain='0..10'}}
        @yScale={{scale-linear range='0..50' domain='0..10'}}
        @defined={{this.defined}}
      />
    `);

    const xScale = scaleLinear([0, 10], [0, 100]);
    const yScale = scaleLinear([0, 10], [0, 50]);
    const areaGenerator = area<Datum>()
      .defined(defined)
      .x((d) => xScale(d.foo))
      .y0(0)
      .y1((d) => yScale(d.bar));
    assert.dom('path').hasAttribute('d', areaGenerator(data) as string);
  });
});
