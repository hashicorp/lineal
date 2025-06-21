/**
 * Copyright IBM Corp. 2020, 2026
 */

import { ScaleIdentity } from '../scale.ts';

import type { IdentityScaleConfig } from '../scale.ts';

export default function scaleIdentity(config: IdentityScaleConfig) {
  return new ScaleIdentity(config);
}
