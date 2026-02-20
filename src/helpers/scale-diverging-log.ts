/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleDivergingLog } from '../utils/scale.ts';

import type { DivergingScaleConfig } from '../utils/scale.ts';

export default function scaleDivergingLog(config: DivergingScaleConfig) {
  return new ScaleDivergingLog(config);
}
