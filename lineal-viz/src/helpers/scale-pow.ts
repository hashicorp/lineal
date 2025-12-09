/**
 * Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScalePow, PowScaleConfig } from '../scale';

export default helper((_, hash: PowScaleConfig) => new ScalePow(hash));
