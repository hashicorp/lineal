/**
 * Copyright IBM Corp. 2020, 2026
 */

interface DateDataPoint {
  x: Date;
  y: Date;
}

interface LinearDatesOptions {
  start?: Date | string | number;
  step?: number;
}

function* linearDates(
  length: number,
  options: LinearDatesOptions,
): Generator<DateDataPoint> {
  const { start, step } = Object.assign(
    { start: new Date(), step: 7 },
    options,
  );

  let x = start instanceof Date ? start : new Date(start);
  for (let i = 0; i < length; i++) {
    yield { x, y: x };
    x = new Date(+x + step * 24 * 60 * 60 * 1000);
  }
}

export default function generateLinearDates(
  length: number,
  options: LinearDatesOptions = {},
): DateDataPoint[] {
  const gen = linearDates(length, options);
  return Array.from(gen);
}
