/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleDivergingPow } from '../scale.ts';

import type { DivergingScaleConfig } from '../scale.ts';

export default function scaleDivergingPow(config: DivergingScaleConfig) {
  return new ScaleDivergingPow(config);
}
