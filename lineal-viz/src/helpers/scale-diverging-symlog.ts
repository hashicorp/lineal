/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScaleDivergingSymlog, DivergingScaleConfig } from '../scale';

export default helper((_, hash: DivergingScaleConfig) => new ScaleDivergingSymlog(hash));
