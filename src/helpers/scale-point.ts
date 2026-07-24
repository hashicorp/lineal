/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScalePoint } from '../utils/scale.ts';

import type { PointScaleConfig } from '../utils/scale.ts';

export default function scalePoint(config: PointScaleConfig) {
  return new ScalePoint(config);
}
