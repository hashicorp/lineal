/**
 * Copyright IBM Corp. 2020, 2026
 */
import Component from '@glimmer/component';
import { ScaleLinear } from '../utils/scale.ts';
import { Encoding } from '../utils/encoding.ts';
import type { Scale } from '../utils/scale.ts';
import type { Accessor } from '../utils/encoding.ts';
import type { CurveArgs } from '../utils/curves.ts';
export interface LineSignature {
    Args: {
        data: any[];
        x: Accessor;
        y: Accessor;
        xScale?: Scale;
        yScale?: Scale;
        curve?: string | CurveArgs;
        defined?: (d: any) => boolean;
    };
    Blocks: {
        default: [];
    };
    Element: SVGPathElement;
}
export default class Line extends Component<LineSignature> {
    get x(): Encoding;
    get y(): Encoding;
    get xScale(): Scale | ScaleLinear | import("../utils/scale.ts").ScaleIdentity;
    get yScale(): Scale | ScaleLinear | import("../utils/scale.ts").ScaleIdentity;
    get curve(): import("d3-shape").CurveFactory | import("d3-shape").CurveBundleFactory;
    get d(): string | null;
}
//# sourceMappingURL=line.d.ts.map