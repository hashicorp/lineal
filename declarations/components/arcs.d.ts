/**
 * Copyright IBM Corp. 2020, 2026
 */
import Component from '@glimmer/component';
import { Encoding } from '../utils/encoding.ts';
import type { PieArcDatum } from 'd3-shape';
import type { Scale } from '../utils/scale.ts';
import type { Accessor } from '../utils/encoding.ts';
export type ArcDatum = {
    [key: string]: unknown;
    fill?: string;
    cssClass?: string;
} & PieArcDatum<number>;
export interface ArcsSignature {
    Args: {
        data: any[];
        theta: Accessor;
        color?: Accessor;
        colorScale?: Scale | string;
        startAngle?: number | string;
        endAngle?: number | string;
        padAngle?: number | string;
        innerRadius?: number;
        outerRadius?: number;
        cornerRadius?: number;
    };
    Blocks: {
        default: [ArcDatum[]];
    };
    Element: SVGPathElement;
}
export default class Arcs extends Component<ArcsSignature> {
    get theta(): Encoding;
    get color(): Encoding | undefined;
    get colorScale(): Scale;
    get useCSSClass(): boolean;
    get startAngle(): number;
    get endAngle(): number;
    get padAngle(): number;
    get arcs(): ArcDatum[];
}
//# sourceMappingURL=arcs.d.ts.map