/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScalePow, PowScaleConfig } from '../scale';

export default helper(([], hash: PowScaleConfig) => new ScalePow(hash));
