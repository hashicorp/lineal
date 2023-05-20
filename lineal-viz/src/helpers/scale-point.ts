/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScalePoint, PointScaleConfig } from '../scale';

export default helper((_, hash: PointScaleConfig) => new ScalePoint(hash));
