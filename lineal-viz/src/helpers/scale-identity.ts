/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import { ScaleIdentity, IdentityScaleConfig } from '../scale';

export default helper(([], hash: IdentityScaleConfig) => new ScaleIdentity(hash));
