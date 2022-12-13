import { scheduleOnce } from '@ember/runloop';
import Component from '@glimmer/component';
import Bounds from '../bounds';
import { Scale } from '../scale';
import { Encoding } from '../encoding';

interface MarkArgs {
  data: any[];
}

export function qualifyScale(
  context: Component<MarkArgs>,
  scale: Scale,
  encoding: Encoding,
  field: string
) {
  if (
    (scale.domain.__temp_duck_type_bounds || scale.domain instanceof Bounds) &&
    !scale.domain.isValid
  ) {
    scheduleOnce('afterRender', context, () => {
      scale.domain.qualify(context.args.data, encoding.accessor);
    });
  }

  if (scale.range instanceof Bounds && !scale.range.isValid) {
    throw new Error(
      `Qualifying @${field}Scale: Cannot determine the bounds for a range without a bounding box for the mark.`
    );
  }
}
