import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { cached } from '../../../cached';
import { Scale } from '../../../scale';

enum Orientation {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

enum OrientationInt {
  Top = 1,
  Right = 2,
  Bottom = 3,
  Left = 4,
}

enum Direction {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

interface AxisArgs {
  scale: Scale;
  orientation: Orientation;
  tickValues?: any[];
  tickFormat?: (t: any) => string;
  tickSize?: number;
  tickSizeInner?: number;
  tickSizeOuter?: number;
  tickPadding?: number;
  offset?: number;
  includeDomain?: boolean;
}

export type Tick = {
  transform: String;
  size: number;
  offset: number;
  textOffset: String;
  label: string;
  textAnchor: string;
  value: any;
};

const DEFAULT_OFFSET = typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 0 : 0.5;
const TEXT_OFFSET = {
  [OrientationInt.Top]: '0em',
  [OrientationInt.Right]: '0.32em',
  [OrientationInt.Bottom]: '0.71em',
  [OrientationInt.Left]: '0.32em',
};
const TEXT_ANCHOR = {
  [OrientationInt.Top]: 'middle',
  [OrientationInt.Right]: 'start',
  [OrientationInt.Bottom]: 'middle',
  [OrientationInt.Left]: 'end',
};

export default class Axis extends Component<AxisArgs> {
  // TODO: Implement tickArguments for d3-axis parity, but maybe not the same signature.
  //tickArguments = [];

  @cached get tickValues() {
    return this.args.tickValues ?? null;
  }

  @cached get tickFormat() {
    return this.args.tickFormat ?? null;
  }

  @cached get tickSizeInner() {
    return this.args.tickSizeInner ?? this.args.tickSize ?? 6;
  }

  @cached get tickSizeOuter() {
    return this.args.tickSizeOuter ?? this.args.tickSize ?? 6;
  }

  @cached get tickPadding() {
    return this.args.tickPadding ?? 3;
  }

  @cached get offset() {
    return this.args.offset ?? DEFAULT_OFFSET;
  }

  get includeDomain() {
    return this.args.includeDomain ?? true;
  }

  @cached get orientation(): OrientationInt {
    const mapping = {
      [Orientation.Top]: OrientationInt.Top,
      [Orientation.Right]: OrientationInt.Right,
      [Orientation.Bottom]: OrientationInt.Bottom,
      [Orientation.Left]: OrientationInt.Left,
    };

    return mapping[this.args.orientation];
  }

  @cached get direction(): Direction {
    return this.orientation === OrientationInt.Left || this.orientation === OrientationInt.Right
      ? Direction.Vertical
      : Direction.Horizontal;
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

  // This hints at the tick orientation top/left one way, bottom/right the other way
  @cached get k(): number {
    const orientation = this.orientation;
    return orientation === OrientationInt.Top || orientation === OrientationInt.Left ? -1 : 1;
  }

  @cached get domainPath(): string {
    const { tickSizeOuter, offset, k } = this;
    const range = this.args.scale.d3Scale.range();

    const range0 = range[0] + offset;
    const range1 = range[range.length - 1] + offset;

    if (this.direction === Direction.Vertical) {
      return tickSizeOuter !== 0
        ? `M${k * tickSizeOuter},${range0}H${offset}V${range1}H${k * tickSizeOuter}`
        : `M${offset},${range0}V${range1}`;
    }
    return tickSizeOuter !== 0
      ? `M${range0},${k * tickSizeOuter}V${offset}H${range1}V${k * tickSizeOuter}`
      : `M${range0},${offset}H${range1}`;
  }

  @cached get values() {
    if (this.tickValues) return this.tickValues;
    if (this.args.scale.d3Scale.ticks) return this.args.scale.d3Scale.ticks();
    return this.args.scale.d3Scale.domain();
  }

  @cached get format() {
    if (this.tickFormat) return this.tickFormat;
    if (this.args.scale.d3Scale.tickFormat) return this.args.scale.d3Scale.tickFormat();
    return (x: any) => x;
  }

  @cached get spacing() {
    return Math.max(this.tickSizeInner, 0) + this.tickPadding;
  }

  @cached get ticks(): Tick[] {
    const { k, format, spacing, tickSizeInner, offset, position, direction, orientation } = this;

    return this.values.map((v: any) => ({
      transform:
        direction === Direction.Horizontal
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
}
