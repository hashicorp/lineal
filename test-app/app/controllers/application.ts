import Controller from '@ember/controller';
import { tracked, cached } from '@glimmer/tracking';
import { action } from '@ember/object';

const rand = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

export default class ApplicationController extends Controller {
  @tracked activeDatum = null;

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

  get frequencyByDay() {
    return [
      { dayN: 0, day: 'Monday', hour: 9, value: rand(1, 20) },
      { dayN: 0, day: 'Monday', hour: 10, value: rand(1, 20) },
      { dayN: 0, day: 'Monday', hour: 11, value: rand(1, 20) },
      { dayN: 0, day: 'Monday', hour: 12, value: rand(1, 20) },

      { dayN: 1, day: 'Tuesday', hour: 11, value: rand(1, 20) },
      { dayN: 1, day: 'Tuesday', hour: 12, value: rand(1, 20) },
      { dayN: 1, day: 'Tuesday', hour: 14, value: rand(1, 20) },
      { dayN: 1, day: 'Tuesday', hour: 18, value: rand(1, 20) },

      { dayN: 2, day: 'Wednesday', hour: 11, value: rand(1, 20) },
      { dayN: 2, day: 'Wednesday', hour: 12, value: rand(1, 20) },

      { dayN: 3, day: 'Thursday', hour: 11, value: rand(1, 20) },
      { dayN: 3, day: 'Thursday', hour: 12, value: rand(1, 20) },
      { dayN: 3, day: 'Thursday', hour: 14, value: rand(1, 20) },
      { dayN: 3, day: 'Thursday', hour: 15, value: rand(1, 20) },
      { dayN: 3, day: 'Thursday', hour: 18, value: rand(1, 20) },

      { dayN: 4, day: 'Friday', hour: 17, value: rand(1, 20) },

      { dayN: 6, day: 'Sunday', hour: 0, value: rand(1, 20) },
      { dayN: 6, day: 'Sunday', hour: 1, value: rand(1, 20) },
      { dayN: 6, day: 'Sunday', hour: 2, value: rand(1, 20) },
      { dayN: 6, day: 'Sunday', hour: 3, value: rand(1, 20) },
      { dayN: 6, day: 'Sunday', hour: 4, value: rand(1, 20) },
    ];
  }

  always = () => true;
  logValue = (...args: any[]) => console.log(...args);

  @action
  updateActiveData(activeData: any) {
    this.activeDatum = activeData ? activeData.datum.datum : null;
  }
}
