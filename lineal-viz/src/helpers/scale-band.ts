/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleBand } from '../scale.ts';

import type { BandScaleConfig } from '../scale.ts';

export default function scaleBand(config: BandScaleConfig) {
  return new ScaleBand(config);
}
