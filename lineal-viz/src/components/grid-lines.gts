/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';

import type { Scale } from '../scale.ts';

// String literal type for component args
export type DirectionType = 'vertical' | 'horizontal';

// Keep enum for backward compatibility
export enum Direction {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export interface GridLinesSignature {
  Args: {
    scale: Scale;
    direction: DirectionType;
    length: number | string;
    lineCount?: number;
    lineValues?: any[];
    offset?: number;
  };

  Blocks: {
    default: [];
  };

  Element: SVGGElement;
}

const DEFAULT_OFFSET =
  typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 0 : 0.5;

export default class GridLines extends Component<GridLinesSignature> {
  @cached
  get lineValues() {
    return this.args.lineValues ?? null;
  }

  @cached
  get lineCount() {
    return this.args.lineCount ?? null;
  }

  @cached
  get offset() {
    return this.args.offset ?? DEFAULT_OFFSET;
  }

  @cached
  get values() {
    if (this.lineValues) return this.lineValues;

    const scale = this.args.scale?.d3Scale;
    if (scale?.ticks) {
      return this.lineCount != null
        ? scale.ticks(this.lineCount)
        : scale.ticks();
    }

    return scale?.domain();
  }

  @cached
  get position() {
    const copy = this.args.scale.d3Scale.copy();
    if (copy.bandwidth) {
      let offset = Math.max(0, copy.bandwidth() - this.offset * 2) / 2;
      if (copy.round()) offset = Math.round(offset);
      return (d: number) => +copy(d) + offset;
    }
    return (d: number) => +copy(d);
  }

  @cached
  get lines() {
    const length =
      typeof this.args.length === 'string'
        ? parseFloat(this.args.length)
        : this.args.length;
    const { direction } = this.args;
    const { offset, position } = this;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    const isHorizontal = direction === Direction.Horizontal;

    return this.values.map((v: any) => ({
      x1: isHorizontal ? 0 : position(v) + offset,
      x2: isHorizontal ? length : position(v) + offset,
      y1: isHorizontal ? position(v) + offset : 0,
      y2: isHorizontal ? position(v) + offset : length,
    }));
  }

  <template>
    <g class="grid-lines">
      {{#each this.lines key="@index" as |l|}}
        <line
          stroke="currentColor"
          x1={{l.x1}}
          x2={{l.x2}}
          y1={{l.y1}}
          y2={{l.y2}}
          ...attributes
        ></line>
      {{/each}}
    </g>
  </template>
}
