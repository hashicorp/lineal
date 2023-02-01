/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScaleThreshold, QuantileScaleConfig } from '../scale';

export default helper(([], hash: QuantileScaleConfig) => new ScaleThreshold(hash));
