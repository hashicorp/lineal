/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScaleDiverging, DivergingScaleConfig } from '../scale';

export default helper((_, hash: DivergingScaleConfig) => new ScaleDiverging(hash));
