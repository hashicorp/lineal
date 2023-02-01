/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const rand = (min, max) => Math.random() * (max - min) + min;
const shuffle = (list) => {
  let len = list.length;
  while (len) {
    len--;
    const idx = Math.floor(Math.random() * len);

    const dest = list[len];
    list[len] = list[idx];
    list[idx] = dest;
  }

  // List is shuffled in place, but the list is still returned for convenience
  return list;
};

const histogram = [
  { bin: '0-18', value: 10 },
  { bin: '19-29', value: 25 },
  { bin: '30-39', value: 100 },
  { bin: '40-49', value: 30 },
  { bin: '50-59', value: 150 },
  { bin: '60-64', value: 20 },
  { bin: '65+', value: 40 },
];

const activity = shuffle([
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
]);

const activitySorted = activity.slice().sort((a, b) => {
  const day = days.indexOf(a.day) - days.indexOf(b.day);
  const hour = a.hour - b.hour;

  return day || hour;
});

const datasets = {
  histogram,
  activity,
  activitySorted,
  days,
};

export default helper(([dataset]) => {
  const data = datasets[dataset];
  if (!data) throw new Error(`No dataset "${dataset}".`);

  return data;
});
