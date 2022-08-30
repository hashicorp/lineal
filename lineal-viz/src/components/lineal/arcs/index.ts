import { scheduleOnce } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { pie } from 'd3-shape';
import { Scale, ScaleOrdinal } from '../../../scale';
import { Accessor, Encoding } from '../../../encoding';
import CSSRange from '../../../css-range';

interface ArcsArgs {
  data: any[];
  theta: Accessor;
  color: Accessor;
  colorScale?: Scale | string;
  startAngle?: number;
  endAngle?: number;
  padAngle?: number;
}

// An angle can be defined as a number or a string ending with 'd'
const parseAngle = (angle: number | string): number => {
  if (typeof angle === 'number') return angle;

  const PATTERN = /(\d+)d$/;

  if (!PATTERN.test(angle)) {
    throw new Error(
      `Could not parse string "${angle}" as degrees. To provide an angle as degrees end a string with a lower-case "d", like "180d". If the angle provided is radians, make sure to provide it as a number, like @angle={{this.angle}}`
    );
  }

  const degrees = parseInt(angle.match(PATTERN)?.[1] ?? '0', 10);
  return (degrees * Math.PI) / 180;
};

export default class Arcs extends Component<ArcsArgs> {
  @cached get theta() {
    return new Encoding(this.args.theta);
  }

  @cached get color() {
    return new Encoding(this.args.theta);
  }

  @cached get colorScale(): Scale {
    // colorScale can be specified as a complete scale
    if (this.args.colorScale instanceof Object) return this.args.colorScale;

    // Or it can be specified as a string provided to CSSRange
    return new ScaleOrdinal({
      domain: this.args.data.map((d) => this.color.accessor(d)),
      range: new CSSRange(this.args.colorScale ?? 'lineal-arcs'),
    });
  }

  @cached get useCSSClass() {
    return this.colorScale instanceof Object && this.colorScale.range instanceof CSSRange;
  }

  @cached get startAngle(): number {
    return parseAngle(this.args.startAngle ?? 0);
  }

  @cached get endAngle(): number {
    return parseAngle(this.args.endAngle ?? Math.PI * 2);
  }

  @cached get padAngle(): number {
    return parseAngle(this.args.padAngle ?? 0);
  }

  @cached get arcs() {
    const generator = pie()
      .startAngle(this.startAngle)
      .endAngle(this.endAngle)
      .padAngle(this.padAngle)
      .value(this.theta.accessor);

    // Initial dataset
    const arcsData = generator(this.args.data);

    // Augment with color classes or fills
    arcsData.forEach((d: any) => {
      if (this.useCSSClass) {
        d.cssClass = this.colorScale.compute(d.value);
      } else {
        d.fill = this.colorScale.compute(d.value);
      }
    });

    return arcsData;
  }
}
