/**
 * Copyright IBM Corp. 2020, 2026
 */
import Component from '@glimmer/component';
import { Encoding } from '../utils/encoding.ts';
import { ScaleLinear } from '../utils/scale.ts';
import type { Accessor } from '../utils/encoding.ts';
import type { Scale } from '../utils/scale.ts';
export interface BarsSignature {
    Args: {
        data: any[];
        x: Accessor;
        y: Accessor;
        width: Accessor;
        height: Accessor;
        xScale?: Scale;
        yScale?: Scale;
        widthScale?: Scale;
        heightScale?: Scale;
        borderRadius?: string;
    };
    Blocks: {
        default: [];
    };
    Element: SVGRectElement | SVGPathElement;
}
export interface BarDatum {
    x: number;
    y: number;
    width: number;
    height: number;
    datum: any;
    d?: string;
}
export default class Bars extends Component<BarsSignature> {
    get x(): Encoding;
    get y(): Encoding;
    get width(): Encoding;
    get height(): Encoding;
    get xScale(): Scale | ScaleLinear | import("../utils/scale.ts").ScaleIdentity;
    get yScale(): Scale | ScaleLinear | import("../utils/scale.ts").ScaleIdentity;
    get widthScale(): Scale | ScaleLinear | import("../utils/scale.ts").ScaleIdentity;
    get heightScale(): Scale | ScaleLinear | import("../utils/scale.ts").ScaleIdentity;
    get borderRadius(): import("../utils/css-four-prop-parse.ts").FourProp | undefined;
    get bars(): BarDatum[];
}
//# sourceMappingURL=bars.d.ts.map