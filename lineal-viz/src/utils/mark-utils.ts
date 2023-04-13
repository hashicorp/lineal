/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { scheduleOnce } from '@ember/runloop';
import Component from '@glimmer/component';
import Bounds from '../bounds';
import { Scale, ScaleIdentity } from '../scale';
import { Accessor, Encoding } from '../encoding';

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
  field: string,
  data?: any[]
): void {
  if (scale instanceof ScaleIdentity) return;

  const qualificationData = data ?? context.args.data;

  if (
    (scale.domain.__temp_duck_type_bounds || scale.domain instanceof Bounds) &&
    !scale.domain.isValid
  ) {
    scheduleOnce('afterRender', context, () => {
      scale.domain.qualify(qualificationData, encoding.accessor);
    });
  }

  if (scale.range instanceof Bounds && !scale.range.isValid) {
    throw new Error(
      `Qualifying @${field}Scale: Cannot determine the bounds for a range without a bounding box for the mark.`
    );
  }
}

/**
 * Given an argument value and maybe a Scale object, determines what Scale should be
 * returned (the Scale, if provided, or an Identity "pass-through" scale if the arg is
 * a static value instead of a field or accessor.
 *
 * @param arg - An accessor, typically from a Mark component's args
 * @param scale - A scale, typically from a Mark component's args
 * @returns A scale, either the provided scale or a ScaleIdentity
 */
export function scaleFrom(arg: Accessor, scale?: Scale): ScaleIdentity | Scale | undefined {
  if (typeof arg === 'number' && scale == null) {
    return new ScaleIdentity({ range: arg });
  }

  return scale;
}
