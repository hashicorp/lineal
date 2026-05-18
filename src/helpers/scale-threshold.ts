/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleThreshold } from '../utils/scale.ts';

import type { QuantileScaleConfig } from '../utils/scale.ts';

export default function scaleThreshold(config: QuantileScaleConfig) {
  return new ScaleThreshold(config);
}
