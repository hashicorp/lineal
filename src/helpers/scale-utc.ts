/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleUtc } from '../utils/scale.ts';

import type { DateScaleConfig } from '../utils/scale.ts';

export default function scaleUtc(config: DateScaleConfig) {
  return new ScaleUtc(config);
}
