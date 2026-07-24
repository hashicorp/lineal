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
        x?: Accessor;
        y0?: Accessor;
        y?: Accessor;
        width: Accessor;
        color?: Accessor;
        xScale?: Scale;
        yScale?: Scale;
        widthScale?: Scale;
        colorScale?: Scale | string;
        borderRadius?: string;
    };
    Blocks: {
        default: [];
    };
    Element: SVGGElement;
}
export interface BarDatum {
    x: number;
    y: number;
    width: number;
    height: number;
    datum: any;
    d?: string;
}
export interface BarSeries {
    bars: BarDatum[];
    fill?: string;
    cssClass?: string;
}
export default class Bars extends Component<BarsSignature> {
    get x(): Encoding;
    get y(): Encoding;
    get y0(): Encoding | undefined;
    get width(): Encoding;
    get color(): Encoding | undefined;
    get xScale(): Scale | ScaleLinear | import("../utils/scale.ts").ScaleIdentity;
    get yScale(): Scale | ScaleLinear | import("../utils/scale.ts").ScaleIdentity;
    get widthScale(): Scale | ScaleLinear | import("../utils/scale.ts").ScaleIdentity;
    get isStacked(): boolean;
    get categories(): undefined | any[];
    get data(): any[];
    get colorScale(): Scale | undefined;
    get useCSSClass(): boolean;
    get borderRadius(): import("../utils/css-four-prop-parse.ts").FourProp | undefined;
    get bars(): BarDatum[] | BarSeries[];
}
//# sourceMappingURL=v-bars.d.ts.map