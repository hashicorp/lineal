import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { Accessor, Encoding } from '../../../encoding';
import { Scale, ScaleLinear, ScaleOrdinal, ScaleSqrt, ScaleIdentity } from '../../../scale';
import CSSRange from '../../../css-range';
import { qualifyScale } from '../../../utils/mark-utils';

interface PointsArgs {
  data: any[];
  x: Accessor;
  y: Accessor;
  size: Accessor;
  color: Accessor;
  xScale?: Scale;
  yScale?: Scale;
  sizeScale?: Scale;
  colorScale?: Scale;
  renderCircles?: boolean;
}

export type PointDatum = {
  x: number;
  y: number;
  size: number;
  fill?: string;
  cssClass?: string;
  datum: any;
};

export default class Points extends Component<PointsArgs> {
  @cached get x() {
    return new Encoding(this.args.x);
  }

  @cached get y() {
    return new Encoding(this.args.y);
  }

  @cached get size() {
    return new Encoding(this.args.size);
  }

  @cached get color() {
    return new Encoding(this.args.color);
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

  @cached get sizeScale() {
    if (typeof this.args.size === 'number' && this.args.sizeScale == null) {
      return new ScaleIdentity({ range: this.args.size });
    }

    const scale = this.args.sizeScale || new ScaleSqrt();
    qualifyScale(this, scale, this.size, 'size');
    return scale;
  }

  // When there is no color scale, don't color-code drawn points
  @cached get colorScale(): Scale | undefined {
    const scale = this.args.colorScale;
    if (scale && this.color) {
      if (scale instanceof Object) return scale;

      return new ScaleOrdinal({
        domain: Array.from(new Set(this.args.data.map((d) => this.color?.accessor(d)))),
        range: new CSSRange(scale),
      });
    }
  }

  @cached get useCSSClass() {
    return this.colorScale instanceof Object && this.colorScale.range instanceof CSSRange;
  }

  @cached get points(): PointDatum[] {
    if (!this.xScale.isValid || !this.yScale.isValid || !this.sizeScale.isValid) return [];

    return this.args.data.map((d: any) => {
      const point: PointDatum = {
        x: this.xScale.compute(this.x.accessor(d)),
        y: this.yScale.compute(this.y.accessor(d)),
        size: this.sizeScale.compute(this.size.accessor(d)),
        datum: d,
      };

      if (this.colorScale) {
        const colorValue = this.colorScale.compute(this.color.accessor(d));
        if (this.useCSSClass) {
          point.cssClass = colorValue;
        } else {
          point.fill = colorValue;
        }
      }

      return point;
    });
  }
}
