import Controller from '@ember/controller';

const rand = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

export default class PointsBandsController extends Controller {
  daysOfWeek = 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.split(
    ' '
  );

  categories = '0-18 18-25 25-35 35-50 50-70 70+'.split(' ');

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

  get ageDemo() {
    return [
      { bracket: '0-18', value: 10 },
      { bracket: '18-25', value: 25 },
      { bracket: '25-35', value: 100 },
      { bracket: '35-50', value: 30 },
      { bracket: '50-70', value: 150 },
      { bracket: '70+', value: 40 },
    ];
  }
}
