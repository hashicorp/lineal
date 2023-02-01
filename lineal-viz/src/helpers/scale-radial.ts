/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScaleRadial, ContinuousScaleConfig } from '../scale';

export default helper(([], hash: ContinuousScaleConfig) => new ScaleRadial(hash));
