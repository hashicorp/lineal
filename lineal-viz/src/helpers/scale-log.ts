/**
 * Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScaleLog, LogScaleConfig } from '../scale';

export default helper((_, hash: LogScaleConfig) => new ScaleLog(hash));
