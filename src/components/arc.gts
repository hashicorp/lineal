/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { hash } from '@ember/helper';
import { arc } from 'd3-shape';

import parseAngle from '../utils/parse-angle.ts';

export interface ArcSignature {
  Args: {
    innerRadius?: number | string;
    outerRadius?: number | string;
    cornerRadius?: number | string;
    padRadius?: number | string;
    startAngle?: number | string;
    endAngle?: number | string;
    padAngle?: number | string;
  };

  Blocks: {
    default: [{ centroid: { x: number; y: number } }];
  };

  Element: SVGPathElement;
}

export default class Arc extends Component<ArcSignature> {
  @cached
  get startAngle(): number {
    return parseAngle(this.args.startAngle ?? 0);
  }

  @cached
  get endAngle(): number {
    return parseAngle(this.args.endAngle ?? Math.PI * 2);
  }

  @cached
  get padAngle(): number | undefined {
    if (this.args.padAngle) return parseAngle(this.args.padAngle);

    return undefined;
  }

  @cached
  get arc() {
    const innerRadius =
      typeof this.args.innerRadius === 'string'
        ? parseFloat(this.args.innerRadius)
        : (this.args.innerRadius ?? 0);
    const outerRadius =
      typeof this.args.outerRadius === 'string'
        ? parseFloat(this.args.outerRadius)
        : (this.args.outerRadius ?? 100);
    const cornerRadius =
      typeof this.args.cornerRadius === 'string'
        ? parseFloat(this.args.cornerRadius)
        : (this.args.cornerRadius ?? 0);
    const padRadius =
      typeof this.args.padRadius === 'string'
        ? parseFloat(this.args.padRadius)
        : this.args.padRadius;

    let generator = arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(cornerRadius)
      .startAngle(this.startAngle)
      .endAngle(this.endAngle);

    if (this.padAngle) {
      generator = generator.padAngle(this.padAngle);
    }

    if (padRadius !== undefined) {
      generator = generator.padRadius(padRadius);
    }

    return generator;
  }

  @cached
  get d() {
    // @ts-expect-error: Bad type upstream
    return this.arc();
  }

  @cached
  get centroid() {
    // @ts-expect-error: Bad type upstream
    const [x, y] = this.arc.centroid();
    return { x, y };
  }

  <template>
    <path d={{this.d}} ...attributes></path>
    {{yield (hash centroid=this.centroid)}}
  </template>
}
