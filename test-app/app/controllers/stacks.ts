import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

const rand = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

export default class StacksController extends Controller {
  @tracked activePop = null;

  daysOfWeek = 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.split(
    ' '
  );

  get frequencyByDay() {
    return [
      { day: 'Monday', hour: 9, value: rand(1, 20) },
      { day: 'Monday', hour: 10, value: rand(1, 20) },
      { day: 'Monday', hour: 11, value: rand(1, 20) },
      { day: 'Monday', hour: 12, value: rand(1, 20) },

      { day: 'Tuesday', hour: 11, value: rand(1, 20) },
      { day: 'Tuesday', hour: 12, value: rand(1, 20) },
      { day: 'Tuesday', hour: 14, value: rand(1, 20) },
      { day: 'Tuesday', hour: 18, value: rand(1, 20) },

      { day: 'Wednesday', hour: 11, value: rand(1, 20) },
      { day: 'Wednesday', hour: 12, value: rand(1, 20) },

      { day: 'Thursday', hour: 11, value: rand(1, 20) },
      { day: 'Thursday', hour: 12, value: rand(1, 20) },
      { day: 'Thursday', hour: 14, value: rand(1, 20) },
      { day: 'Thursday', hour: 15, value: rand(1, 20) },
      { day: 'Thursday', hour: 18, value: rand(1, 20) },

      { day: 'Friday', hour: 17, value: rand(1, 20) },

      { day: 'Sunday', hour: 0, value: rand(1, 20) },
      { day: 'Sunday', hour: 1, value: rand(1, 20) },
      { day: 'Sunday', hour: 2, value: rand(1, 20) },
      { day: 'Sunday', hour: 3, value: rand(1, 20) },
      { day: 'Sunday', hour: 4, value: rand(1, 20) },
    ];
  }

  get paddedFrequencyByDay() {
    const freq = this.frequencyByDay;
    const data = [];
    for (const day of this.daysOfWeek) {
      for (let hour = 0; hour < 24; hour++) {
        data.push(
          freq.find((d) => d.day === day && d.hour === hour) || {
            day,
            hour,
            value: 2,
          }
        );
      }
    }
    return data;
  }

  @action
  updateActiveDataPop(activeData: any) {
    console.log('activePop', activeData);
    this.activePop = activeData;
  }
}
