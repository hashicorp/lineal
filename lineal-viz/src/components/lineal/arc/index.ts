import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { arc } from 'd3-shape';

interface ArcArgs {
  innerRadius?: number;
  outerRadius?: number;
  cornerRadius?: number;
  padRadius?: number;
  startAngle?: number | string;
  endAngle?: number | string;
  padAngle?: number | string;
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

export default class Line extends Component<ArcArgs> {
  @cached get startAngle(): number {
    return parseAngle(this.args.startAngle ?? 0);
  }

  @cached get endAngle(): number {
    return parseAngle(this.args.endAngle ?? Math.PI * 2);
  }

  @cached get padAngle(): number | undefined {
    if (this.args.padAngle) return parseAngle(this.args.padAngle);
  }

  @cached get arc() {
    let generator = arc()
      .innerRadius(this.args.innerRadius ?? 0)
      .outerRadius(this.args.outerRadius ?? 100)
      .cornerRadius(this.args.cornerRadius ?? 0)
      .startAngle(this.startAngle)
      .endAngle(this.endAngle);

    if (this.padAngle) {
      generator = generator.padAngle(this.padAngle);
    }

    if (this.args.padRadius) {
      generator = generator.padRadius(this.args.padRadius);
    }

    return generator;
  }

  @cached get d() {
    // @ts-ignore
    return this.arc();
  }

  @cached get centroid() {
    // @ts-ignore
    const [x, y] = this.arc.centroid();
    console.log('Computing centroid!', x, y);
    return { x, y };
  }
}
