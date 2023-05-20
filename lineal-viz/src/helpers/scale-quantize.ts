/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScaleQuantize, QuantizeScaleConfig } from '../scale';

export default helper((_, hash: QuantizeScaleConfig) => new ScaleQuantize(hash));
