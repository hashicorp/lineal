/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleQuantize } from '../utils/scale.ts';

import type { QuantizeScaleConfig } from '../utils/scale.ts';

export default function scaleQuantize(config: QuantizeScaleConfig) {
  return new ScaleQuantize(config);
}
