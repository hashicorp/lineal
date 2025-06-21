/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleSymlog } from '../scale.ts';

import type { ContinuousScaleConfig } from '../scale.ts';

export default function scaleSymlog(config: ContinuousScaleConfig) {
  return new ScaleSymlog(config);
}
