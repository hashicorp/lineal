/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleQuantile } from '../scale.ts';

import type { QuantileScaleConfig } from '../scale.ts';

export default function scaleQuantile(config: QuantileScaleConfig) {
  return new ScaleQuantile(config);
}
