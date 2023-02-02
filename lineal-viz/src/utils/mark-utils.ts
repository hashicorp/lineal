/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { scheduleOnce } from '@ember/runloop';
import Component from '@glimmer/component';
import Bounds from '../bounds';
import { Scale } from '../scale';
import { Encoding } from '../encoding';

/**
 * A valid Mark component must have a `data` arg.
 */
export interface MarkArgs {
  data: any[];
}

/**
 * This is used internally by Marks to qualify a scale with the data arg
 * on the next tick of the runloop (to avoid mutating a property twice in
 * the same render).
 *
 * @param context - A Lineal Mark comonent
 * @param scale - The scale to qualify
 * @param encoding - The encoding whose accesor to use for data lookups
 * @param field - The name of the encoded channel (used for formatting error messages)
 * @throws - When the scale has an invalid range (which is not computed as
 *           part of scale qualification)
 */
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
