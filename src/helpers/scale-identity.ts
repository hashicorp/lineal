/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleIdentity } from '../utils/scale.ts';

import type { IdentityScaleConfig } from '../utils/scale.ts';

export default function scaleIdentity(config: IdentityScaleConfig) {
  return new ScaleIdentity(config);
}
