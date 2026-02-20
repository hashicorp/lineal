/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleSymlog } from '../utils/scale.ts';

import type { ContinuousScaleConfig } from '../utils/scale.ts';

export default function scaleSymlog(config: ContinuousScaleConfig) {
  return new ScaleSymlog(config);
}
