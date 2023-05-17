/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScaleLinear, ContinuousScaleConfig } from '../scale';

export default helper((_, hash: ContinuousScaleConfig) => new ScaleLinear(hash));
