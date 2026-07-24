/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleLog } from '../utils/scale.ts';

import type { LogScaleConfig } from '../utils/scale.ts';

export default function scaleLog(config: LogScaleConfig) {
  return new ScaleLog(config);
}
