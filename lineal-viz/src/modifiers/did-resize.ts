/**
 * did-resize modifier
 *
 * Localized implementation based on ember-resize-modifier by Jordan Hawker.
 * Original source: https://github.com/elwayman02/ember-resize-modifier
 * License: MIT
 *
 * This modifier triggers a callback when resize events are observed on the target element.
 * It uses a single shared ResizeObserver instance for performance, with handlers stored
 * in a WeakMap keyed by element.
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import type Owner from '@ember/owner';

type ResizeHandler = (
  entry: ResizeObserverEntry,
  observer: ResizeObserver,
) => void;

export interface DidResizeSignature {
  Args: {
    Positional: [handler: ResizeHandler, options?: ResizeObserverOptions];
  };
  Element: Element;
}

export default class DidResizeModifier extends Modifier<DidResizeSignature> {
  // Public API
  declare element: Element | null;
  declare handler: ResizeHandler;
  options: ResizeObserverOptions = {};

  // Shared singleton observer and handler registry
  static observer: ResizeObserver | null = null;
  static handlers: WeakMap<Element, ResizeHandler> | null = null;

  constructor(
    owner: Owner,
    args: {
      positional: [ResizeHandler, ResizeObserverOptions?];
      named: object;
    },
  ) {
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

  modify(
    element: Element,
    positional: [ResizeHandler, ResizeObserverOptions?],
  ): void {
    unobserve(this);

    this.element = element;

    const [handler, options] = positional;

    // Save arguments for when we need them
    this.handler = handler;
    this.options = options ?? this.options;

    this.observe();
  }

  observe(): void {
    if (DidResizeModifier.observer && this.element) {
      this.addHandler();
      DidResizeModifier.observer.observe(this.element, this.options);
    }
  }

  addHandler(): void {
    if (this.element) {
      DidResizeModifier.handlers?.set(this.element, this.handler);
    }
  }

  removeHandler(): void {
    if (this.element) {
      DidResizeModifier.handlers?.delete(this.element);
    }
  }
}

function unobserve(instance: DidResizeModifier): void {
  if (instance.element && DidResizeModifier.observer) {
    DidResizeModifier.observer.unobserve(instance.element);
    instance.removeHandler();
  }
}
