/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleRadial } from '../utils/scale.ts';

import type { ContinuousScaleConfig } from '../utils/scale.ts';

export default function scaleRadial(config: ContinuousScaleConfig) {
  return new ScaleRadial(config);
}
