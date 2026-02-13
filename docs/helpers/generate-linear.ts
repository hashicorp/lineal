/**
 * Copyright IBM Corp. 2020, 2026
 */

interface DataPoint {
  x: number;
  y: number;
}

interface LinearOptions {
  start?: number;
  step?: number;
}

function* linear(length: number, options: LinearOptions): Generator<DataPoint> {
  const { start, step } = Object.assign({ start: 0, step: 10 }, options);

  let x = start;
  for (let i = 0; i < length; i++) {
    yield { x, y: x };
    x += step;
  }
}

export default function generateLinear(
  length: number,
  options: LinearOptions = {},
): DataPoint[] {
  const gen = linear(length, options);
  return Array.from(gen);
}
