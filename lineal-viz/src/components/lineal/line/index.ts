import { scheduleOnce } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { line } from 'd3-shape';
import { extent } from 'd3-array';
import { Scale, ScaleLinear } from '../../../scale';
import { Accessor, Encoding } from '../../../encoding';
import Bounds from '../../../bounds';

interface LineArgs {
  data: any[];
  x: Accessor;
  y: Accessor;
  xScale: Scale;
  yScale: Scale;
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

    if (scale.domain instanceof Bounds && !scale.domain.isValid) {
      if (!this.x.field) {
        throw new Error(
          'Cannot determine the bounds for a dataset without a field accessor. Either provide a field encoding for @x or provide a scale with a qualified domain for @xScale'
        );
      } else {
        scheduleOnce('afterRender', this, () => {
          scale.domain = extent(this.args.data, this.x.accessor);
        });
      }
    }

    if (scale.range instanceof Bounds && !scale.range.isValid) {
      throw new Error(
        'Cannot determine the bounds for a range without a bounding box for the mark.'
      );
    }

    return scale;
  }

  @cached get yScale() {
    const scale = this.args.yScale || new ScaleLinear();

    if (scale.domain instanceof Bounds && !scale.domain.isValid) {
      if (!this.y.field) {
        throw new Error(
          'Cannot determine the bounds for a dataset without a field accessor. Either provide a field encoding for @y or provide a scale with a qualified domain for @yScale'
        );
      } else {
        scheduleOnce('afterRender', this, () => {
          scale.domain = extent(this.args.data, this.y.accessor);
        });
      }
    }

    if (scale.range instanceof Bounds && !scale.range.isValid) {
      throw new Error(
        'Cannot determine the bounds for a range without a bounding box for the mark.'
      );
    }

    return scale;
  }

  @cached get d() {
    if (!this.xScale.isValid || !this.yScale.isValid) return '';

    const generator = line()
      .x((d) => this.xScale.compute(this.x.accessor(d)))
      .y((d) => this.yScale.compute(this.y.accessor(d)));
    return generator(this.args.data);
  }
}
