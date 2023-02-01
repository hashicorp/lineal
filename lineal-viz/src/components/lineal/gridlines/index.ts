/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { Scale } from '../../../scale';

export enum Direction {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export interface GridlinesArgs {
  scale: Scale;
  direction: Direction;
  length: number;
  lineValues?: any[];
  offset?: number;
}

const DEFAULT_OFFSET = typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 0 : 0.5;

export default class Gridlines extends Component<GridlinesArgs> {
  @tracked lineValues = this.args.lineValues || null;

  @cached get offset() {
    return this.args.offset ?? DEFAULT_OFFSET;
  }

  @cached get values() {
    if (this.lineValues) return this.lineValues;
    if (this.args.scale.d3Scale.ticks) return this.args.scale.d3Scale.ticks();
    return this.args.scale.d3Scale.domain();
  }

  @cached get position() {
    const copy = this.args.scale.d3Scale.copy();
    if (copy.bandwidth) {
      let offset = Math.max(0, copy.bandwidth() - this.offset * 2) / 2;
      if (copy.round()) offset = Math.round(offset);
      return (d: number) => +copy(d) + offset;
    }
    return (d: number) => +copy(d);
  }

  @cached get lines() {
    const { length, direction } = this.args;
    const { offset, position } = this;
    const isHorizontal = direction === Direction.Horizontal;

    return this.values.map((v: any) => ({
      x1: isHorizontal ? 0 : position(v) + offset,
      x2: isHorizontal ? length : position(v) + offset,
      y1: isHorizontal ? position(v) + offset : 0,
      y2: isHorizontal ? position(v) + offset : length,
    }));
  }
}
