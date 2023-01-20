import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { Accessor, Encoding } from '../../../encoding';
import { Scale, ScaleLinear, ScaleOrdinal, ScaleSqrt, ScaleIdentity } from '../../../scale';
import CSSRange from '../../../css-range';
import { qualifyScale } from '../../../utils/mark-utils';

interface BarsArgs {
  data: any[];
  x: Accessor;
  y: Accessor;
  width: Accessor;
  height: Accessor;
  xScale?: Scale;
  yScale?: Scale;
  widthScale?: Scale;
  heightScale?: Scale;
}

interface BarDatum {
  x: number;
  y: number;
  width: number;
  height: number;
  datum: any;
}

export default class Bars extends Component<BarsArgs> {
  @cached get x() {
    return new Encoding(this.args.x);
  }

  @cached get y() {
    return new Encoding(this.args.y);
  }

  @cached get width() {
    return new Encoding(this.args.width);
  }

  @cached get height() {
    return new Encoding(this.args.height);
  }

  @cached get xScale() {
    if (typeof this.args.x === 'number' && this.args.xScale == null) {
      return new ScaleIdentity({ range: this.args.x });
    }

    const scale = this.args.xScale || new ScaleLinear();
    qualifyScale(this, scale, this.x, 'x');
    return scale;
  }

  @cached get yScale() {
    if (typeof this.args.y === 'number' && this.args.yScale == null) {
      return new ScaleIdentity({ range: this.args.y });
    }

    const scale = this.args.yScale || new ScaleLinear();
    qualifyScale(this, scale, this.y, 'y');
    return scale;
  }

  @cached get widthScale() {
    if (typeof this.args.width === 'number' && this.args.widthScale == null) {
      return new ScaleIdentity({ range: this.args.width });
    }

    const scale = this.args.widthScale || new ScaleLinear();
    qualifyScale(this, scale, this.width, 'width');
    return scale;
  }

  @cached get heightScale() {
    if (typeof this.args.height === 'number' && this.args.heightScale == null) {
      return new ScaleIdentity({ range: this.args.height });
    }

    const scale = this.args.heightScale || new ScaleLinear();
    qualifyScale(this, scale, this.height, 'height');
    return scale;
  }

  @cached get bars(): BarDatum[] {
    if (
      !this.xScale.isValid ||
      !this.yScale.isValid ||
      !this.widthScale.isValid ||
      !this.heightScale.isValid
    ) {
      return [];
    }

    return this.args.data.map((d: any) => {
      const bar: BarDatum = {
        x: this.xScale.compute(this.x.accessor(d)),
        y: this.yScale.compute(this.y.accessor(d)),
        width: this.widthScale.compute(this.width.accessor(d)),
        height: this.heightScale.compute(this.height.accessor(d)),
        datum: d,
      };

      return bar;
    });
  }
}
