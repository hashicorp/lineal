/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleQuantile } from '../utils/scale.ts';

import type { QuantileScaleConfig } from '../utils/scale.ts';

export default function scaleQuantile(config: QuantileScaleConfig) {
  return new ScaleQuantile(config);
}
