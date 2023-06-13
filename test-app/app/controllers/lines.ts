/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { tracked, cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { ScaleLinear } from '@lineal-viz/lineal/scale';
import { extent } from 'd3-array';

const wiggle = (x: number) => x + Math.random() * x * 0.15 - x * 0.075;

export default class LinesController extends Controller {
  @tracked activeDatum = null;
  @tracked populationX = this.population;

  constructor(...args: any[]) {
    super(...args);

    setInterval(() => {
      console.log('beep');
      console.log(this.population);
      this.populationX = this.population.map((d) => ({
        ...d,
        people: wiggle(d.people as number),
      }));
    }, 100);
  }

  get pXScale() {
    return new ScaleLinear({
      domain: extent(this.populationX, (d) => +d.year).map((d) => d ?? 0),
    });
  }

  get pYScale() {
    return new ScaleLinear({
      domain: extent(this.populationX, (d) => d.people as number).map(
        (d) => d ?? 0
      ),
    });
  }

  get population() {
    const data = this.model as any[];
    const reduction = data.reduce((agg: any, record: any) => {
      agg[record.year] = agg[record.year]
        ? agg[record.year] + record.people
        : record.people;
      return agg;
    }, {});

    return Object.entries(reduction).map(([year, people]) => ({
      year,
      people,
    }));
  }

  @cached
  get sine() {
    const data: { x: number; y?: number }[] = [];
    for (let x = 0; x < 50; x += Math.PI / 8) {
      data.push({ x, y: Math.sin(x) });
    }

    // Corrode some data
    for (let i = 0; i < 30; i++) {
      const datum = data[Math.floor(Math.random() * data.length)];
      if (datum) datum.y = undefined;
    }

    return data;
  }

  get sineFiltered() {
    return this.sine.filter((d) => d.y != undefined);
  }

  @action
  updateActiveData(activeData: any) {
    this.activeDatum = activeData ? activeData.datum.datum : null;
  }
}
