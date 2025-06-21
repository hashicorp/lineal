/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleLinear } from '../scale.ts';

import type { ContinuousScaleConfig } from '../scale.ts';

export default function scaleLinear(config: ContinuousScaleConfig) {
  return new ScaleLinear(config);
}
