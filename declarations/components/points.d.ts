/**
 * Copyright IBM Corp. 2020, 2026
 */
import Component from '@glimmer/component';
import { Encoding } from '../utils/encoding.ts';
import { ScaleLinear, ScaleSqrt } from '../utils/scale.ts';
import type { Accessor } from '../utils/encoding.ts';
import type { Scale } from '../utils/scale.ts';
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
    get x(): Encoding;
    get y(): Encoding;
    get size(): Encoding;
    get color(): Encoding | undefined;
    get xScale(): Scale | ScaleLinear | import("../utils/scale.ts").ScaleIdentity;
    get yScale(): Scale | ScaleLinear | import("../utils/scale.ts").ScaleIdentity;
    get sizeScale(): Scale | ScaleSqrt | import("../utils/scale.ts").ScaleIdentity;
    get colorScale(): Scale | undefined;
    get useCSSClass(): boolean;
    get points(): PointDatum[];
}
//# sourceMappingURL=points.d.ts.map