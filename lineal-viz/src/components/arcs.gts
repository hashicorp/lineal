/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { pie } from 'd3-shape';

import { ScaleOrdinal } from '../scale.ts';
import { Encoding } from '../encoding.ts';
import CSSRange from '../css-range.ts';
import parseAngle from '../utils/parse-angle.ts';
import Arc from './arc.gts';

import type { PieArcDatum } from 'd3-shape';
import type { Scale } from '../scale.ts';
import type { Accessor } from '../encoding.ts';

export type ArcDatum = {
  [key: string]: unknown; // Thank you TS for this gem!!
  fill?: string;
  cssClass?: string;
} & PieArcDatum<number>;

export interface ArcsSignature {
  Args: {
    data: any[];
    theta: Accessor;
    color?: Accessor;
    colorScale?: Scale | string;
    startAngle?: number | string;
    endAngle?: number | string;
    padAngle?: number | string;
    innerRadius?: number;
    outerRadius?: number;
    cornerRadius?: number;
  };

  Blocks: {
    default: [ArcDatum[]];
  };

  Element: SVGPathElement;
}

export default class Arcs extends Component<ArcsSignature> {
  @cached
  get theta() {
    return new Encoding(this.args.theta);
  }

  @cached
  get color() {
    if (this.args.color) return new Encoding(this.args.color);

    return undefined;
  }

  @cached
  get colorScale(): Scale {
    // colorScale can be specified as a complete scale
    if (this.args.colorScale instanceof Object) return this.args.colorScale;

    // Or it can be specified as a string provided to CSSRange
    return new ScaleOrdinal({
      domain: Array.from(
        new Set(
          this.args.data.map(
            this.color ? (d) => this.color?.accessor(d) : (_, i) => i,
          ),
        ),
      ),
      range: new CSSRange(this.args.colorScale ?? 'lineal-arcs'),
    });
  }

  @cached
  get useCSSClass() {
    return (
      this.colorScale instanceof Object &&
      this.colorScale.range instanceof CSSRange
    );
  }

  @cached
  get startAngle(): number {
    return parseAngle(this.args.startAngle ?? 0);
  }

  @cached
  get endAngle(): number {
    return parseAngle(this.args.endAngle ?? Math.PI * 2);
  }

  @cached
  get padAngle(): number {
    return parseAngle(this.args.padAngle ?? 0);
  }

  @cached
  get arcs() {
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
      const colorValue = this.colorScale.compute(
        this.color ? this.color.accessor(d.data) : index,
      );
      if (this.useCSSClass) {
        d.cssClass = colorValue;
      } else {
        d.fill = colorValue;
      }
    });

    return arcsData;
  }

  <template>
    {{#if (has-block)}}
      {{yield this.arcs}}
    {{else}}
      {{#each this.arcs as |arc|}}
        <Arc
          @startAngle={{arc.startAngle}}
          @endAngle={{arc.endAngle}}
          @padAngle={{arc.padAngle}}
          @innerRadius={{@innerRadius}}
          @outerRadius={{@outerRadius}}
          @cornerRadius={{@cornerRadius}}
          class={{arc.cssClass}}
          fill={{arc.fill}}
          ...attributes
        />
      {{/each}}
    {{/if}}
  </template>
}
