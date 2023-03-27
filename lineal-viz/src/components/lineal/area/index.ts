/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { area, stack, CurveFactory, SeriesPoint } from 'd3-shape';
import { group, merge } from 'd3-array';
import { Scale, ScaleLinear, ScaleOrdinal } from '../../../scale';
import { Accessor, Encoding } from '../../../encoding';
import CSSRange from '../../../css-range';
import { curveFor, CurveArgs } from '../../../utils/curves';
import { scaleFrom, qualifyScale } from '../../../utils/mark-utils';

export interface AreaArgs {
  data: any[];
  x: Accessor;
  y: Accessor;
  y0: Accessor;
  color: Accessor;
  xScale?: Scale;
  yScale?: Scale;
  colorScale?: Scale;
  curve?: string | CurveArgs;
  defined?: (d: any) => boolean;
}

export interface AreaSeries {
  d: string | null;
  fill?: string;
  cssClass?: string;
}

export default class Area extends Component<AreaArgs> {
  @cached get x() {
    return new Encoding(this.args.x);
  }

  @cached get y() {
    return new Encoding(this.args.y);
  }

  @cached get y0() {
    return new Encoding(this.args.y0);
  }

  @cached get color() {
    if (this.args.color) return new Encoding(this.args.color);
  }

  @cached get xScale() {
    const scale = scaleFrom(this.args.x, this.args.xScale) || new ScaleLinear();
    qualifyScale(this, scale, this.x, 'x');
    return scale;
  }

  @cached get yScale() {
    const scale = scaleFrom(this.args.y, this.args.yScale) || new ScaleLinear();

    // When the data is stacked, the scale must be qualified using the computed
    // stack data since the cumulative y-values for an x-value will be greater than
    // any individual y-value in the original dataset.
    if (this.isStacked) {
      qualifyScale(this, scale, new Encoding((d) => d[1]), 'y', merge(this.data));
    } else {
      qualifyScale(this, scale, this.y, 'y');
    }
    return scale;
  }

  @cached get categories(): undefined | any[] {
    if (!this.color) return;
    return Array.from(new Set(this.args.data.map((d) => this.color?.accessor(d))));
  }

  get isStacked(): boolean {
    return !!this.categories;
  }

  @cached get data(): any[] {
    // Data is only pre-transformed when the data is stacked.
    if (!this.isStacked || !this.color) return this.args.data;

    const categories = this.categories ?? [];
    const xField = this.x.field ?? 'x';

    // Transform from records into table using x-accessor as ID and y-accessor as cell value
    const groupByX = group(this.args.data, this.x.accessor, this.color.accessor);

    const table = Array.from(groupByX).reduce((rows, [id, records]) => {
      rows.push({
        [xField]: id,
        ...categories.reduce((columns, category) => {
          // It is assumed that there is a single record per category, otherwise it would
          // mean there were duplicte records in the source data.
          columns[category] = this.y.accessor(records.get(category)?.[0] ?? {});
          return columns;
        }, {}),
      });
      return rows;
    }, [] as any[]);

    // Stack tabular into matrix for use with area generator
    return stack().keys(categories)(table);
  }

  // When there is no color scale, don't color-code drawn points
  @cached get colorScale(): Scale | undefined {
    const scale = this.args.colorScale;
    if (scale && this.color) {
      if (scale instanceof Object) return scale;

      return new ScaleOrdinal({
        domain: Array.from(this.categories ?? []),
        range: new CSSRange(scale),
      });
    }
  }

  @cached get useCSSClass() {
    return this.colorScale instanceof Object && this.colorScale.range instanceof CSSRange;
  }

  @cached get curve(): CurveFactory {
    return curveFor(this.args.curve) as CurveFactory;
  }

  @cached get d() {
    if (!this.xScale.isValid || !this.yScale.isValid) return '';

    if (this.isStacked) {
      const generator = area<SeriesPoint<any>>()
        .curve(this.curve)
        .x((d) => this.xScale.compute(this.x.accessor(d.data)))
        .y0((d) => this.yScale.compute(d[0]))
        .y1((d) => this.yScale.compute(d[1]));

      return this.data.map((series) => {
        const d: AreaSeries = { d: generator(series) };
        if (this.colorScale) {
          const colorValue = this.colorScale.compute(series.key);
          if (this.useCSSClass) {
            d.cssClass = colorValue;
          } else {
            d.fill = colorValue;
          }
        }
        return d;
      });
    } else {
      const generator = area()
        .curve(this.curve)
        .defined(
          this.args.defined || ((d) => this.y.accessor(d) != null && this.x.accessor(d) != null)
        )
        .x((d) => this.xScale.compute(this.x.accessor(d)))
        .y0((d) => this.yScale.compute(this.y0.accessor(d)))
        .y1((d) => this.yScale.compute(this.y.accessor(d)));

      return generator(this.args.data);
    }
  }
}
