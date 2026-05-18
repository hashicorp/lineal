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
export declare const CURVES: {
    [key: string]: shape.CurveFactory | shape.CurveBundleFactory;
};
/**
 * Creates a curve function from a string or argument object.
 *
 * @param [curve] - When a string, looks up the corresponding curve factory and returns it.
 *                  When a `CurveArgs`, looks up the corresponding curve factory based on `curve.name`,
 *                  applies parameters, and returns the resulting curve function.
 * @throws {Error} - When there is no curve factory for the specified curve.
 */
export declare const curveFor: (curve?: string | CurveArgs) => shape.CurveFactory | shape.CurveBundleFactory;
//# sourceMappingURL=curves.d.ts.map