/**
 * Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScaleDiverging, DivergingScaleConfig } from '../scale';

export default helper((_, hash: DivergingScaleConfig) => new ScaleDiverging(hash));
