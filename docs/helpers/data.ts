/**
 * Copyright IBM Corp. 2020, 2026
 */

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

type Day = (typeof days)[number];

interface HistogramEntry {
  bin: string;
  value: number;
}

interface ActivityEntry {
  day: Day;
  hour: number;
  value: number;
}

const rand = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

const shuffle = <T>(list: T[]): T[] => {
  let len = list.length;
  while (len) {
    len--;
    const idx = Math.floor(Math.random() * len);

    const dest = list[len]!;
    list[len] = list[idx]!;
    list[idx] = dest;
  }

  return list;
};

const histogram: HistogramEntry[] = [
  { bin: '0-18', value: 10 },
  { bin: '19-29', value: 25 },
  { bin: '30-39', value: 100 },
  { bin: '40-49', value: 30 },
  { bin: '50-59', value: 150 },
  { bin: '60-64', value: 20 },
  { bin: '65+', value: 40 },
];

const activity: ActivityEntry[] = shuffle([
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

interface Datasets {
  histogram: HistogramEntry[];
  activity: ActivityEntry[];
  activitySorted: ActivityEntry[];
  days: readonly Day[];
}

const datasets: Datasets = {
  histogram,
  activity,
  activitySorted,
  days,
};

type DatasetName = keyof Datasets;

export default function data<K extends DatasetName>(dataset: K): Datasets[K] {
  const dataResult = datasets[dataset];
  if (!dataResult) throw new Error(`No dataset "${String(dataset)}".`);

  return dataResult as Datasets[K];
}
