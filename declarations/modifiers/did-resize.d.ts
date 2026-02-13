/**
 * Copyright IBM Corp. 2020, 2026
 * SPDX-License-Identifier: MPL-2.0
 */
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
import type Owner from '@ember/owner';
type ResizeHandler = (entry: ResizeObserverEntry, observer: ResizeObserver) => void;
export interface DidResizeSignature {
    Args: {
        Positional: [handler: ResizeHandler, options?: ResizeObserverOptions];
    };
    Element: Element;
}
export default class DidResizeModifier extends Modifier<DidResizeSignature> {
    element: Element | null;
    handler: ResizeHandler;
    options: ResizeObserverOptions;
    static observer: ResizeObserver | null;
    static handlers: WeakMap<Element, ResizeHandler> | null;
    constructor(owner: Owner, args: {
        positional: [ResizeHandler, ResizeObserverOptions?];
        named: object;
    });
    modify(element: Element, positional: [ResizeHandler, ResizeObserverOptions?]): void;
    observe(): void;
    addHandler(): void;
    removeHandler(): void;
}
export {};
//# sourceMappingURL=did-resize.d.ts.map