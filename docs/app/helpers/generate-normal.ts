/**
 * Copyright IBM Corp. 2020, 2026
 */

interface DataPoint {
  x: number;
  y: number;
}

interface NormalOptions {
  mean?: number;
  stddev?: number;
  sort?: boolean;
}

function* normal(length: number, options: NormalOptions): Generator<DataPoint> {
  const { mean, stddev } = Object.assign({ mean: 0, stddev: 1 }, options);

  for (let x = 0; x < length; x++) {
    const u = Math.random();
    const v = Math.random();
    const norm = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    const y = norm * stddev - -mean;
    yield { x, y };
  }
}

export default function generateNormal(
  length: number,
  options: NormalOptions = {},
): DataPoint[] {
  const gen = normal(length, options);
  const data = Array.from(gen);
  return options.sort ? data.sort((a, b) => a.y - b.y) : data;
}
