/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScaleDivergingSqrt, DivergingScaleConfig } from '../scale';

export default helper((_, hash: DivergingScaleConfig) => new ScaleDivergingSqrt(hash));
