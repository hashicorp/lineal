/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleDivergingSqrt } from '../scale.ts';

import type { DivergingScaleConfig } from '../scale.ts';

export default function scaleDivergingSqrt(config: DivergingScaleConfig) {
  return new ScaleDivergingSqrt(config);
}
