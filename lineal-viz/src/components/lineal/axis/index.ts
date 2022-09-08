import { scheduleOnce } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { extent } from 'd3-array';
import { Scale } from '../../../scale';
import Bounds from '../../../bounds';

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

interface AreaArgs {
  scale: Scale;
  orientation: Orientation;
  tickValues?: any[];
  tickFormat?: (t: any) => string;
  tickSize?: number;
  tickSizeInner?: number;
  tickSizeOuter?: number;
  tickPadding?: number;
  offset?: number;
}

const DEFAULT_OFFSET = typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 0 : 0.5;

export default class Area extends Component<AreaArgs> {
  @tracked tickValues = this.args.tickValues || null;
  @tracked tickFormat = this.args.tickFormat || null;
  @tracked tickSizeInner = this.args.tickSizeInner || 6;
  @tracked tickSizeOuter = this.args.tickSizeOuter || 6;
  @tracked tickPadding = this.args.tickPadding || 3;
  @tracked offset = this.args.offset || DEFAULT_OFFSET;

  tickArguments = [];

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

  @cached get domainPath(): string {
    const { tickSizeOuter, offset } = this;
    const orientation = this.orientation;
    const range = this.args.scale.d3Scale.range();

    const range0 = range[0] + offset;
    const range1 = range[range.length - 1] + offset;
    const k = orientation === OrientationInt.Top || orientation === OrientationInt.Left ? -1 : 1;

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
    // 1. If tickValues, return tickValues
    // 2. If tickArguments, return scale.ticks.apply(scale, tickArguments) (can we do better than this?)
    // 3. If scale.ticks, return scale.ticks()
    // 4. Return scale.domain()
    if (this.tickValues) return this.tickValues;
    if (this.args.scale.d3Scale.ticks) return this.args.scale.d3Scale.ticks();
    return this.args.scale.d3Scale.domain();
  }

  @cached get format() {
    // 1. If tickFormat, return tickFormat
    // 2. If tickArguments, return scale.tickFormat.apply(scale, tickArguments)
    // 3. If scale.tickFormat, return scale.tickFormat()
    // 4. Return identity function x => x
    if (this.tickFormat) return this.tickFormat;
    if (this.args.scale.d3Scale.tickFormat) return this.args.scale.d3Scale.tickFormat;
    return (x: any) => x;
  }

  @cached get spacing() {
    return Math.max(this.tickSizeInner, 0) + this.tickPadding;
  }

  @cached get ticks() {
    return [];
  }
}
