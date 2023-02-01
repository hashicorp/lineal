/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';

function* sine(length) {
  let x = 0;
  while (x < length) {
    yield { x, y: (Math.sin(x) * x) / 5 };
    x++;
  }
}

export default helper(([length]) => {
  const gen = sine(length);
  return Array.from(gen);
});
