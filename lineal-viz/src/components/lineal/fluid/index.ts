/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export interface FluidArgs {}

export default class Fluid extends Component<FluidArgs> {
  @tracked width = 0;
  @tracked height = 10;
  @tracked entry: ResizeObserverEntry | undefined;

  @action
  onResize(entry: ResizeObserverEntry) {
    this.width = entry.contentRect.width;
    this.height = entry.contentRect.height;
    this.entry = entry;
  }
}
