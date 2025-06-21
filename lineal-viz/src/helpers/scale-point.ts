/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScalePoint } from '../scale.ts';

import type { PointScaleConfig } from '../scale.ts';

export default function scalePoint(config: PointScaleConfig) {
  return new ScalePoint(config);
}
