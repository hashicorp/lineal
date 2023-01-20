import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { arc } from 'd3-shape';
import parseAngle from '../../../utils/parse-angle';

interface ArcArgs {
  innerRadius?: number;
  outerRadius?: number;
  cornerRadius?: number;
  padRadius?: number;
  startAngle?: number | string;
  endAngle?: number | string;
  padAngle?: number | string;
}

export default class Arc extends Component<ArcArgs> {
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
    return { x, y };
  }
}
