/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleLog } from '../scale.ts';

import type { LogScaleConfig } from '../scale.ts';

export default function scaleLog(config: LogScaleConfig) {
  return new ScaleLog(config);
}
