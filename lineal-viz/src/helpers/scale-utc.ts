/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleUtc } from '../scale.ts';

import type { DateScaleConfig } from '../scale.ts';

export default function scaleUtc(config: DateScaleConfig) {
  return new ScaleUtc(config);
}
