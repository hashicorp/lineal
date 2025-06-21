/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleSqrt } from '../scale.ts';

import type { ContinuousScaleConfig } from '../scale.ts';

export default function scaleSqrt(config: ContinuousScaleConfig) {
  return new ScaleSqrt(config);
}
