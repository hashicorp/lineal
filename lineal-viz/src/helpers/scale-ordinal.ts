/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScaleOrdinal, OrdinalScaleConfig } from '../scale';

export default helper((_, hash: OrdinalScaleConfig) => new ScaleOrdinal(hash));
