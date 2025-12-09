/**
 * Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: MPL-2.0
 */

function* normal(length, options) {
  const { mean, stddev } = Object.assign({ mean: 0, stddev: 1 }, options);

  for (let x = 0; x < length; x++) {
    const u = Math.random();
    const v = Math.random();
    const norm = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    const y = norm * stddev - -mean;
    yield { x, y };
  }
}

import { helper } from '@ember/component/helper';

export default helper(([length], options) => {
  const gen = normal(length, options);
  const data = Array.from(gen);
  return options.sort ? data.sort((a, b) => a.y - b.y) : data;
});
