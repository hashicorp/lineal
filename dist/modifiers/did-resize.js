import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

/**
 * Copyright IBM Corp. 2020, 2026
 * SPDX-License-Identifier: MPL-2.0
 */

class DidResizeModifier extends Modifier {
  // Public API

  options = {};

  // Shared singleton observer and handler registry
  static observer = null;
  static handlers = null;
  constructor(owner, args) {
    super(owner, args);
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    if (!DidResizeModifier.observer) {
      DidResizeModifier.handlers = new WeakMap();
      DidResizeModifier.observer = new ResizeObserver((entries, observer) => {
        window.requestAnimationFrame(() => {
          for (const entry of entries) {
            const handler = DidResizeModifier.handlers?.get(entry.target);
            if (handler) handler(entry, observer);
          }
        });
      });
    }
    registerDestructor(this, unobserve);
  }
  modify(element, positional) {
    unobserve(this);
    this.element = element;
    const [handler, options] = positional;

    // Save arguments for when we need them
    this.handler = handler;
    this.options = options ?? this.options;
    this.observe();
  }
  observe() {
    if (DidResizeModifier.observer && this.element) {
      this.addHandler();
      DidResizeModifier.observer.observe(this.element, this.options);
    }
  }
  addHandler() {
    if (this.element) {
      DidResizeModifier.handlers?.set(this.element, this.handler);
    }
  }
  removeHandler() {
    if (this.element) {
      DidResizeModifier.handlers?.delete(this.element);
    }
  }
}
function unobserve(instance) {
  if (instance.element && DidResizeModifier.observer) {
    DidResizeModifier.observer.unobserve(instance.element);
    instance.removeHandler();
  }
}

export { DidResizeModifier as default };
//# sourceMappingURL=did-resize.js.map
