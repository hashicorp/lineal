/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScaleQuantile, QuantileScaleConfig } from '../scale';

export default helper((_, hash: QuantileScaleConfig) => new ScaleQuantile(hash));
