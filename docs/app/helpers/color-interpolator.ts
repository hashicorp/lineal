/**
 * Copyright IBM Corp. 2020, 2026
 */

import * as d3 from 'd3-scale-chromatic';

export default function colorInterpolator(name: string): (t: number) => string {
  // Pretty unsafe thing to do!
  const interpolator = (d3 as unknown as Record<string, (t: number) => string>)[
    name
  ]!;
  return (t: number) => interpolator(1 - t);
}
