/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { helper } from '@ember/component/helper';
import * as sinon from 'sinon';

// In Ember 4 you can call functions like helpers, which is great for
// calling spies in templates. However, for 3.x ember-try compat, we
// do this instead.
export default helper(
  ([spy, ...positional]: [sinon.SinonSpy, unknown[]], opts): void => {
    const args = [...positional, opts];
    spy(...args);
  }
);
