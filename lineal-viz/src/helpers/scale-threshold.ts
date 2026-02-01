/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleThreshold } from '../scale.ts';

import type { QuantileScaleConfig } from '../scale.ts';

export default function scaleThreshold(config: QuantileScaleConfig) {
  return new ScaleThreshold(config);
}
