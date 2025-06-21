/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleOrdinal } from '../scale.ts';

import type { OrdinalScaleConfig } from '../scale.ts';

export default function scaleOrdinal(config: OrdinalScaleConfig) {
  return new ScaleOrdinal(config);
}
