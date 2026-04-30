/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleTime } from '../utils/scale.ts';

import type { DateScaleConfig } from '../utils/scale.ts';

export default function scaleTime(config: DateScaleConfig) {
  return new ScaleTime(config);
}
