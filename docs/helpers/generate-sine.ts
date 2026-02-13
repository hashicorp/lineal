/**
 * Copyright IBM Corp. 2020, 2026
 */

interface DataPoint {
  x: number;
  y: number;
}

function* sine(length: number): Generator<DataPoint> {
  let x = 0;
  while (x < length) {
    yield { x, y: (Math.sin(x) * x) / 5 };
    x++;
  }
}

export default function generateSine(length: number): DataPoint[] {
  const gen = sine(length);
  return Array.from(gen);
}
