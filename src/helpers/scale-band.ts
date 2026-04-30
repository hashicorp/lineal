/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleBand } from '../utils/scale.ts';

import type { BandScaleConfig } from '../utils/scale.ts';

export default function scaleBand(config: BandScaleConfig) {
  return new ScaleBand(config);
}
