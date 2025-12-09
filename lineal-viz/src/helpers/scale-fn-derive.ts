/**
 * Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { Scale } from '../scale';

export default helper(([scale]: [Scale], config: object) => scale.derive(config));
