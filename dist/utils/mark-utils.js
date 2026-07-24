import { scheduleOnce } from '@ember/runloop';
import Bounds from './bounds.js';
import { ScaleIdentity } from './scale.js';

/**
 * Copyright IBM Corp. 2020, 2026
 */


/**
 * A valid Mark component must have a `data` arg.
 */

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
function qualifyScale(context, scale, encoding, field, data) {
  if (scale instanceof ScaleIdentity) return;
  const qualificationData = data ?? context.args.data;

  // Bindable closure
  function afterRender() {
    scale.domain.qualify(qualificationData, encoding.accessor);
  }
  if ((scale.domain.__temp_duck_type_bounds || scale.domain instanceof Bounds) && !scale.domain.isValid) {
    // eslint-disable-next-line ember/no-runloop
    scheduleOnce('afterRender', context, afterRender);
  }
  if (scale.range instanceof Bounds && !scale.range.isValid) {
    throw new Error(`Qualifying @${field}Scale: Cannot determine the bounds for a range without a bounding box for the mark.`);
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
function scaleFrom(arg, scale) {
  if (typeof arg === 'number' && scale == null) {
    return new ScaleIdentity({
      range: arg
    });
  }
  return scale;
}

export { qualifyScale, scaleFrom };
//# sourceMappingURL=mark-utils.js.map
