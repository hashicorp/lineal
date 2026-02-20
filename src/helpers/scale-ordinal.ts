/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleOrdinal } from '../utils/scale.ts';

import type { OrdinalScaleConfig } from '../utils/scale.ts';

export default function scaleOrdinal(config: OrdinalScaleConfig) {
  return new ScaleOrdinal(config);
}
