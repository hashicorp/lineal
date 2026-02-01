/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleRadial } from '../scale.ts';

import type { ContinuousScaleConfig } from '../scale.ts';

export default function scaleRadial(config: ContinuousScaleConfig) {
  return new ScaleRadial(config);
}
