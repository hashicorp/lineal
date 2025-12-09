/**
 * Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { arc } from 'd3-shape';
import parseAngle from '../../../utils/parse-angle';

export interface ArcArgs {
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
    // @ts-expect-error: Bad type upstream
    return this.arc();
  }

  @cached get centroid() {
    // @ts-expect-error: Bad type upstream
    const [x, y] = this.arc.centroid();
    return { x, y };
  }
}
