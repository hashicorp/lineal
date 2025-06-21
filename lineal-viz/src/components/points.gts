/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { not, or } from 'ember-truth-helpers';

import { Encoding } from '../encoding.ts';
import { ScaleLinear, ScaleOrdinal, ScaleSqrt } from '../scale.ts';
import { scaleFrom, qualifyScale } from '../utils/mark-utils.ts';
import CSSRange from '../css-range.ts';

import type { Accessor } from '../encoding.ts';
import type { Scale } from '../scale.ts';

export interface PointsArgs {
  Args: {
    data: any[];
    x: Accessor;
    y: Accessor;
    size: Accessor;
    color?: Accessor;
    xScale?: Scale;
    yScale?: Scale;
    sizeScale?: Scale;
    colorScale?: Scale | string;
    renderCircles?: boolean;
  };

  Blocks: {
    default: [PointDatum[]];
  };

  Element: SVGCircleElement;
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
  @cached
  get x() {
    return new Encoding(this.args.x);
  }

  @cached
  get y() {
    return new Encoding(this.args.y);
  }

  @cached
  get size() {
    return new Encoding(this.args.size);
  }

  @cached
  get color() {
    if (this.args.color) return new Encoding(this.args.color);
    return undefined;
  }

  @cached
  get xScale() {
    const scale = scaleFrom(this.args.x, this.args.xScale) || new ScaleLinear();
    qualifyScale(this, scale, this.x, 'x');
    return scale;
  }

  @cached
  get yScale() {
    const scale = scaleFrom(this.args.y, this.args.yScale) || new ScaleLinear();
    qualifyScale(this, scale, this.y, 'y');
    return scale;
  }

  @cached
  get sizeScale() {
    const scale =
      scaleFrom(this.args.size, this.args.sizeScale) || new ScaleSqrt();
    qualifyScale(this, scale, this.size, 'size');
    return scale;
  }

  // When there is no color scale, don't color-code drawn points
  @cached
  get colorScale(): Scale | undefined {
    const scale = this.args.colorScale;

    if (scale && this.color) {
      if (scale instanceof Object) return scale;

      return new ScaleOrdinal({
        domain: Array.from(
          new Set(this.args.data.map((d) => this.color?.accessor(d))),
        ),
        range: new CSSRange(scale),
      });
    }

    return undefined;
  }

  @cached
  get useCSSClass() {
    return (
      this.colorScale instanceof Object &&
      this.colorScale.range instanceof CSSRange
    );
  }

  @cached
  get points(): PointDatum[] {
    if (!this.xScale.isValid || !this.yScale.isValid || !this.sizeScale.isValid)
      return [];

    return this.args.data.map((d: any) => {
      const point: PointDatum = {
        x: this.xScale.compute(this.x.accessor(d)),
        y: this.yScale.compute(this.y.accessor(d)),
        size: this.sizeScale.compute(this.size.accessor(d)),
        datum: d,
      };

      if (this.colorScale && this.color) {
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

  <template>
    {{#if (or @renderCircles (not (has-block)))}}
      {{#each this.points as |p|}}
        <circle
          cx={{p.x}}
          cy={{p.y}}
          r={{p.size}}
          fill={{p.fill}}
          class={{p.cssClass}}
          ...attributes
        ></circle>
      {{/each}}
    {{/if}}

    {{#if (has-block)}}
      {{yield this.points}}
    {{/if}}
  </template>
}
