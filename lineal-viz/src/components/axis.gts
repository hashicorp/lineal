/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { eq } from 'ember-truth-helpers';

import type { Scale } from '../utils/scale.ts';

// String literal types for component args
export type OrientationType = 'top' | 'right' | 'bottom' | 'left';
export type DirectionType = 'vertical' | 'horizontal';

// Keep enums for backward compatibility
export enum Orientation {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

// Internal numeric mapping for orientation comparisons
const OrientationInt = {
  top: 1,
  right: 2,
  bottom: 3,
  left: 4,
} as const;

type OrientationIntValue = (typeof OrientationInt)[OrientationType];

export enum Direction {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export interface AxisSignature {
  Args: {
    scale: Scale;
    orientation: OrientationType;
    tickCount?: number;
    tickValues?: any[];
    tickFormat?: (t: any) => string;
    tickSize?: number;
    tickSizeInner?: number;
    tickSizeOuter?: number;
    tickPadding?: number;
    offset?: number;
    includeDomain?: boolean;
  };

  Blocks: {
    default: [Tick, number];
  };

  Element: SVGGElement;
}

export type Tick = {
  transform: string;
  size: number;
  offset: number;
  textOffset: string;
  label: string;
  textAnchor: string;
  value: any;
};

const DEFAULT_OFFSET =
  typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 0 : 0.5;
const TEXT_OFFSET: Record<OrientationIntValue, string> = {
  [OrientationInt.top]: '0em',
  [OrientationInt.right]: '0.32em',
  [OrientationInt.bottom]: '0.71em',
  [OrientationInt.left]: '0.32em',
};
const TEXT_ANCHOR: Record<OrientationIntValue, string> = {
  [OrientationInt.top]: 'middle',
  [OrientationInt.right]: 'start',
  [OrientationInt.bottom]: 'middle',
  [OrientationInt.left]: 'end',
};

export default class Axis extends Component<AxisSignature> {
  @cached
  get tickCount() {
    return this.args.tickCount ?? null;
  }

  @cached
  get tickValues() {
    return this.args.tickValues ?? null;
  }

  @cached
  get tickFormat() {
    return this.args.tickFormat ?? null;
  }

  @cached
  get tickSizeInner() {
    return this.args.tickSizeInner ?? this.args.tickSize ?? 6;
  }

  @cached
  get tickSizeOuter() {
    return this.args.tickSizeOuter ?? this.args.tickSize ?? 6;
  }

  @cached
  get tickPadding() {
    return this.args.tickPadding ?? 3;
  }

  @cached
  get offset() {
    return this.args.offset ?? DEFAULT_OFFSET;
  }

  get includeDomain() {
    return this.args.includeDomain ?? true;
  }

  @cached
  get orientation(): OrientationIntValue {
    return OrientationInt[this.args.orientation];
  }

  @cached
  get direction(): DirectionType {
    return this.orientation === OrientationInt.left ||
      this.orientation === OrientationInt.right
      ? 'vertical'
      : 'horizontal';
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

  // This hints at the tick orientation top/left one way, bottom/right the other way
  @cached
  get k(): number {
    const orientation = this.orientation;
    return orientation === OrientationInt.top ||
      orientation === OrientationInt.left
      ? -1
      : 1;
  }

  @cached
  get domainPath(): string {
    const { tickSizeOuter, offset, k } = this;
    const range = this.args.scale.d3Scale.range();

    const range0 = range[0] + offset;
    const range1 = range[range.length - 1] + offset;

    if (this.direction === 'vertical') {
      return tickSizeOuter !== 0
        ? `M${k * tickSizeOuter},${range0}H${offset}V${range1}H${
            k * tickSizeOuter
          }`
        : `M${offset},${range0}V${range1}`;
    }
    return tickSizeOuter !== 0
      ? `M${range0},${k * tickSizeOuter}V${offset}H${range1}V${
          k * tickSizeOuter
        }`
      : `M${range0},${offset}H${range1}`;
  }

  @cached
  get values() {
    if (this.tickValues) return this.tickValues;

    const scale = this.args.scale?.d3Scale;
    if (scale?.ticks) {
      return this.tickCount != null
        ? scale.ticks(this.tickCount)
        : scale.ticks();
    }

    return scale?.domain();
  }

  @cached
  get format() {
    if (this.tickFormat) return this.tickFormat;
    if (this.args.scale.d3Scale.tickFormat)
      return this.args.scale.d3Scale.tickFormat();
    return (x: any) => x;
  }

  @cached
  get spacing() {
    return Math.max(this.tickSizeInner, 0) + this.tickPadding;
  }

  @cached
  get ticks(): Tick[] {
    const {
      k,
      format,
      spacing,
      tickSizeInner,
      offset,
      position,
      direction,
      orientation,
    } = this;

    return this.values.map((v: any) => ({
      transform:
        direction === 'horizontal'
          ? `translate(${position(v) + offset},0)`
          : `translate(0,${position(v) + offset})`,
      size: k * tickSizeInner,
      offset: k * spacing,
      textOffset: TEXT_OFFSET[orientation],
      label: format(v),
      textAnchor: TEXT_ANCHOR[orientation],
      value: v,
    }));
  }

  <template>
    <svg>
      <g class="axis" ...attributes>
        {{#if this.includeDomain}}
          <path
            class="domain"
            stroke="currentColor"
            d={{this.domainPath}}
          ></path>
        {{/if}}

        {{#if (eq this.direction "horizontal")}}

          {{#each this.ticks key="@index" as |tick index|}}
            <g transform={{tick.transform}}>
              {{#if (has-block)}}
                {{yield tick index}}
              {{else}}
                <line stroke="currentColor" y2={{tick.size}}></line>
                {{#if tick.label}}
                  <text
                    fill="currentColor"
                    y={{tick.offset}}
                    dy={{tick.textOffset}}
                    text-anchor={{tick.textAnchor}}
                  >{{tick.label}}</text>
                {{/if}}
              {{/if}}
            </g>
          {{/each}}

        {{else}}

          {{#each this.ticks key="@index" as |tick index|}}
            <g transform={{tick.transform}}>
              {{#if (has-block)}}
                {{yield tick index}}
              {{else}}
                <line stroke="currentColor" x2={{tick.size}}></line>
                {{#if tick.label}}
                  <text
                    fill="currentColor"
                    x={{tick.offset}}
                    dy={{tick.textOffset}}
                    text-anchor={{tick.textAnchor}}
                  >{{tick.label}}</text>
                {{/if}}
              {{/if}}
            </g>
          {{/each}}

        {{/if}}
      </g>
    </svg>
  </template>
}
