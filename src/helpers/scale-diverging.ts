/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleDiverging } from '../utils/scale.ts';

import type { DivergingScaleConfig } from '../utils/scale.ts';

export default function scaleDiverging(config: DivergingScaleConfig) {
  return new ScaleDiverging(config);
}
