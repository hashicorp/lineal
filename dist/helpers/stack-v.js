import Stack from '../transforms/stack.js';

/**
 * Copyright IBM Corp. 2020, 2026
 */

function stackV(config) {
  return new Stack(Object.assign({}, config, {
    direction: 'vertical'
  }));
}

export { stackV as default };
//# sourceMappingURL=stack-v.js.map
