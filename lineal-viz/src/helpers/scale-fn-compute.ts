/**
 * Copyright IBM Corp. 2020, 2026
 */

import type { Scale } from '../scale.ts';

export default function scaleFnCompute(scale: Scale, value: any) {
  return scale.compute(value);
}
