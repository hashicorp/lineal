import Controller from '@ember/controller';
import { cached } from '@glimmer/tracking';

export default class ApplicationController extends Controller {
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

  always = () => true;
  logValue = (...args: any[]) => console.log(...args);
}
