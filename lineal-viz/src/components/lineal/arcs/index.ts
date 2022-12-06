import Component from '@glimmer/component';
import { cached } from '../../../cached';
import { pie, PieArcDatum } from 'd3-shape';
import { Scale, ScaleOrdinal } from '../../../scale';
import { Accessor, Encoding } from '../../../encoding';
import CSSRange from '../../../css-range';
import parseAngle from '../../../utils/parse-angle';

interface ArcsArgs {
  data: any[];
  theta: Accessor;
  color: Accessor;
  colorScale?: Scale | string;
  startAngle?: number;
  endAngle?: number;
  padAngle?: number;
}

export type ArcDatum = {
  [key: string]: unknown; // Thank you TS for this gem!!
  fill?: string;
  cssClass?: string;
} & PieArcDatum<Number>;

export default class Arcs extends Component<ArcsArgs> {
  @cached get theta() {
    return new Encoding(this.args.theta);
  }

  @cached get color() {
    if (this.args.color) return new Encoding(this.args.color);
  }

  @cached get colorScale(): Scale {
    // colorScale can be specified as a complete scale
    if (this.args.colorScale instanceof Object) return this.args.colorScale;

    // Or it can be specified as a string provided to CSSRange
    return new ScaleOrdinal({
      domain: Array.from(
        new Set(this.args.data.map(this.color ? (d) => this.color?.accessor(d) : (_, i) => i))
      ),
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
      .value(this.theta.accessor)
      .sortValues(null);

    // Initial dataset
    const arcsData = generator(this.args.data) as ArcDatum[];

    // Augment with color classes or fills
    arcsData.forEach((d: any, index: number) => {
      const colorValue = this.colorScale.compute(this.color ? this.color.accessor(d.data) : index);
      if (this.useCSSClass) {
        d.cssClass = colorValue;
      } else {
        d.fill = colorValue;
      }
    });

    return arcsData;
  }
}
