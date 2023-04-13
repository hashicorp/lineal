/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import * as d3 from 'd3-scale-chromatic';

export default helper(([name]) => {
  // Pretty unsafe thing to do!
  return (t) => d3[name](1 - t);
});
