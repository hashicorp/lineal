/**
 * Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import CSSRange from '../css-range';

export default helper(([name]: [string]) => new CSSRange(name));
