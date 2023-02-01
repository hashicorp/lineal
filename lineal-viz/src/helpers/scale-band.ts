/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScaleBand, BandScaleConfig } from '../scale';

export default helper(([], hash: BandScaleConfig) => new ScaleBand(hash));
