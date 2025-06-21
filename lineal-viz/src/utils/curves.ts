/**
 * Copyright IBM Corp. 2020, 2026
 */

import * as shape from 'd3-shape';

export type CurveArgs = {
  name: string;
  beta?: number;
  tension?: number;
  alpha?: number;
};

/**
 * A mapping of `string`s to D3 curve factories.
 *
 * This is useful for safely specifying curve functions in templates.
 */
export const CURVES: {
  [key: string]: shape.CurveFactory | shape.CurveBundleFactory;
} = {
  basis: shape.curveBasis,
  basisClosed: shape.curveBasisClosed,
  basisOpen: shape.curveBasisOpen,
  bumpX: shape.curveBumpX,
  bumpY: shape.curveBumpY,
  bundle: shape.curveBundle, // bundle#beta
  cardinal: shape.curveCardinal, // cardinal#tension
  cardinalClosed: shape.curveCardinalClosed,
  cardinalOpen: shape.curveCardinalOpen,
  catmullRom: shape.curveCatmullRom, // catmullRom#alpha
  catmullRomClosed: shape.curveCatmullRomClosed,
  catmullRomOpen: shape.curveCatmullRomOpen,
  linear: shape.curveLinear,
  linearClosed: shape.curveLinearClosed,
  monotoneX: shape.curveMonotoneX,
  monotoneY: shape.curveMonotoneY,
  natural: shape.curveNatural,
  step: shape.curveStep,
  stepAfter: shape.curveStepAfter,
  stepBefore: shape.curveStepBefore,
};

/**
 * Creates a curve function from a string or argument object.
 *
 * @param [curve] - When a string, looks up the corresponding curve factory and returns it.
 *                  When a `CurveArgs`, looks up the corresponding curve factory based on `curve.name`,
 *                  applies parameters, and returns the resulting curve function.
 * @throws {Error} - When there is no curve factory for the specified curve.
 */
export const curveFor = (
  curve?: string | CurveArgs,
): shape.CurveFactory | shape.CurveBundleFactory => {
  if (!curve) return shape.curveLinear;
  if (typeof curve === 'string') {
    if (!CURVES[curve]) {
      throw new Error(
        `No curve factory "${curve}". See all curve factories here: https://github.com/d3/d3-shape#curves`,
      );
    }
    return CURVES[curve];
  }

  const curveArgs: CurveArgs = curve;

  if (curveArgs.name === 'bundle') {
    return shape.curveBundle.beta(curveArgs.beta ?? 0.85);
  } else if (curveArgs.name.startsWith('catmullRom')) {
    return (CURVES[curveArgs.name] as shape.CurveCatmullRomFactory).alpha(
      curveArgs.alpha ?? 0.5,
    );
  } else if (curveArgs.name.startsWith('cardinal')) {
    return (CURVES[curveArgs.name] as shape.CurveCardinalFactory).tension(
      curveArgs.tension ?? 0,
    );
  }

  // In the event someone passes in curve args for a curve that takes no args,
  // just return the appropriate scale
  if (!CURVES[curveArgs.name]) {
    throw new Error(
      `No curve factory "${curveArgs.name}". See all curve factories here: https://github.com/d3/d3-shape#curves`,
    );
  }
  return CURVES[curveArgs.name]!;
};
