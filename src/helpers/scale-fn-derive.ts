/**
 * Copyright IBM Corp. 2020, 2026
 */

import type { Scale } from '../utils/scale.ts';

export default function scaleFnDerive(scale: Scale, config: object) {
  return scale.derive(config);
}
