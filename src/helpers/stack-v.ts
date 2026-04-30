/**
 * Copyright IBM Corp. 2020, 2026
 */

import Stack from '../transforms/stack.ts';

import type { StackConfig } from '../transforms/stack.ts';

export default function stackV(config: StackConfig) {
  return new Stack(Object.assign({}, config, { direction: 'vertical' }));
}
