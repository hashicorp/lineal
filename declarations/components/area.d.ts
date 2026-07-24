/**
 * Copyright IBM Corp. 2020, 2026
 */
import Component from '@glimmer/component';
import { Encoding } from '../utils/encoding.ts';
import { ScaleLinear } from '../utils/scale.ts';
import type { CurveFactory } from 'd3-shape';
import type { CurveArgs } from '../utils/curves.ts';
import type { Accessor } from '../utils/encoding.ts';
import type { Scale } from '../utils/scale.ts';
export interface AreaSignature {
    Args: {
        data: any[];
        x?: Accessor;
        y?: Accessor;
        y0?: Accessor;
        color?: Accessor;
        xScale?: Scale;
        yScale?: Scale;
        colorScale?: Scale | string;
        curve?: string | CurveArgs;
        defined?: (d: any) => boolean;
    };
    Blocks: {
        default: [];
    };
    Element: SVGPathElement;
}
export interface AreaSeries {
    d: string | null;
    fill?: string;
    cssClass?: string;
}
export default class Area extends Component<AreaSignature> {
    get x(): Encoding;
    get y(): Encoding;
    get y0(): Encoding | undefined;
    get color(): Encoding | undefined;
    get xScale(): Scale | ScaleLinear | import("../utils/scale.ts").ScaleIdentity;
    get yScale(): Scale | ScaleLinear | import("../utils/scale.ts").ScaleIdentity;
    get categories(): undefined | any[];
    get isStacked(): boolean;
    get data(): any[];
    get colorScale(): Scale | undefined;
    get useCSSClass(): boolean;
    get curve(): CurveFactory;
    get d(): string | AreaSeries[] | null;
}
//# sourceMappingURL=area.d.ts.map