import { scheduleOnce } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import * as shape from 'd3-shape';
import { extent } from 'd3-array';
import { Scale, ScaleLinear } from '../../../scale';
import { Accessor, Encoding } from '../../../encoding';
import Bounds from '../../../bounds';

const CURVE_MAP: { [key: string]: shape.CurveFactory | shape.CurveBundleFactory } = {
  basis: shape.curveBasis,
  basisClosed: shape.curveBasisClosed,
  basisOpen: shape.curveBasisOpen,
  bumpX: shape.curveBumpX,
  bumpY: shape.curveBumpY,
  bundle: shape.curveBundle, // bundle#beta
  cardinal: shape.curveCardinal, // cardinal#tension
  cardinalClosed: shape.curveCardinalClosed,
  cardinalOpen: shape.curveCardinalOpen,
  catmullRom: shape.curveCatmullRom, // catmullRom#alpha
  catmullRomClosed: shape.curveCatmullRomClosed,
  catmullRomOpen: shape.curveCatmullRomOpen,
  linear: shape.curveLinear,
  linearClosed: shape.curveLinearClosed,
  monotoneX: shape.curveMonotoneX,
  monotoneY: shape.curveMonotoneY,
  natural: shape.curveNatural,
  step: shape.curveStep,
  stepAfter: shape.curveStepAfter,
  stepBefore: shape.curveStepBefore,
};

type CurveArgs = {
  name: string;
  beta?: number;
  tension?: number;
  alpha?: number;
};

interface LineArgs {
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
    this.qualifyScale(scale, this.x, 'x');
    return scale;
  }

  @cached get yScale() {
    const scale = this.args.yScale || new ScaleLinear();
    this.qualifyScale(scale, this.y, 'y');
    return scale;
  }

  @cached get curve(): shape.CurveFactory | shape.CurveBundleFactory {
    if (!this.args.curve) return shape.curveLinear;
    if (typeof this.args.curve === 'string') {
      if (!CURVE_MAP[this.args.curve]) {
        throw new Error(
          `No curve factory "${this.args.curve}". See all curve factories here: https://github.com/d3/d3-shape#curves`
        );
      }
      return CURVE_MAP[this.args.curve];
    }

    const curveArgs: CurveArgs = this.args.curve;

    if (curveArgs.name === 'bundle') {
      return shape.curveBundle.beta(curveArgs.beta ?? 0.85);
    } else if (curveArgs.name.startsWith('catmullRom')) {
      return (CURVE_MAP[curveArgs.name] as shape.CurveCatmullRomFactory).alpha(
        curveArgs.alpha ?? 0.5
      );
    } else if (curveArgs.name.startsWith('cardinal')) {
      return (CURVE_MAP[curveArgs.name] as shape.CurveCardinalFactory).tension(
        curveArgs.tension ?? 0
      );
    }

    // In the event someone passes in curve args for a curve that takes no args,
    // just return the appropriate scale
    return CURVE_MAP[curveArgs.name];
  }

  @cached get d() {
    if (!this.xScale.isValid || !this.yScale.isValid) return '';

    const generator = shape
      .line()
      .curve(this.curve)
      .defined(this.args.defined || ((d) => this.y.accessor(d) != null))
      .x((d) => this.xScale.compute(this.x.accessor(d)))
      .y((d) => this.yScale.compute(this.y.accessor(d)));
    return generator(this.args.data);
  }

  qualifyScale(scale: Scale, encoding: Encoding, field: string) {
    if (scale.domain instanceof Bounds && !scale.domain.isValid) {
      scheduleOnce('afterRender', this, () => {
        scale.domain = extent(this.args.data, encoding.accessor);
      });
    }

    if (scale.range instanceof Bounds && !scale.range.isValid) {
      throw new Error(
        `Qualifying @${field}Scale: Cannot determine the bounds for a range without a bounding box for the mark.`
      );
    }
  }
}
