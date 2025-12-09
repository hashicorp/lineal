/**
 * Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import Stack, { StackConfig } from '../transforms/stack';

export default helper((_, hash: StackConfig) => new Stack(hash));
