/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleLinear } from '../utils/scale.ts';

import type { ContinuousScaleConfig } from '../utils/scale.ts';

export default function scaleLinear(config: ContinuousScaleConfig) {
  return new ScaleLinear(config);
}
