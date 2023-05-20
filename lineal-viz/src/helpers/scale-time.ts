/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScaleTime, DateScaleConfig } from '../scale';

export default helper((_, hash: DateScaleConfig) => new ScaleTime(hash));
