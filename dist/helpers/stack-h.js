import Stack from '../transforms/stack.js';

/**
 * Copyright IBM Corp. 2020, 2026
 */

function stackH(config) {
  return new Stack(Object.assign({}, config, {
    direction: 'horizontal'
  }));
}

export { stackH as default };
//# sourceMappingURL=stack-h.js.map
