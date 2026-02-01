/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScalePow } from '../scale.ts';

import type { PowScaleConfig } from '../scale.ts';

export default function scalePow(config: PowScaleConfig) {
  return new ScalePow(config);
}
