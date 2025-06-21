/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleDivergingSymlog } from '../scale.ts';

import type { DivergingScaleConfig } from '../scale.ts';

export default function scaleDivergingSymlog(config: DivergingScaleConfig) {
  return new ScaleDivergingSymlog(config);
}
