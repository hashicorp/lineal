import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { line } from 'd3-shape';
import { Scale, ScaleLinear } from '../../../scale';
import { Accessor, Encoding } from '../../../encoding';
import { curveFor, CurveArgs } from '../../../utils/curves';
import { qualifyScale } from '../../../utils/mark-utils';

export interface LineArgs {
  data: any[];
  x: Accessor;
  y: Accessor;
  xScale?: Scale;
  yScale?: Scale;
  curve?: string | CurveArgs;
  defined?: (d: any) => boolean;
}

export default class Line extends Component<LineArgs> {
  @cached get x() {
    return new Encoding(this.args.x);
  }

  @cached get y() {
    return new Encoding(this.args.y);
  }

  @cached get xScale() {
    const scale = this.args.xScale || new ScaleLinear();
    qualifyScale(this, scale, this.x, 'x');
    return scale;
  }

  @cached get yScale() {
    const scale = this.args.yScale || new ScaleLinear();
    qualifyScale(this, scale, this.y, 'y');
    return scale;
  }

  @cached get curve() {
    return curveFor(this.args.curve);
  }

  @cached get d() {
    if (!this.xScale.isValid || !this.yScale.isValid) return '';

    const generator = line()
      .curve(this.curve)
      .defined(
        this.args.defined || ((d) => this.y.accessor(d) != null && this.x.accessor(d) != null)
      )
      .x((d) => this.xScale.compute(this.x.accessor(d)))
      .y((d) => this.yScale.compute(this.y.accessor(d)));

    return generator(this.args.data);
  }
}
