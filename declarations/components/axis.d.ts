/**
 * Copyright IBM Corp. 2020, 2026
 */
import Component from '@glimmer/component';
import type { Scale } from '../utils/scale.ts';
export type OrientationType = 'top' | 'right' | 'bottom' | 'left';
export type DirectionType = 'vertical' | 'horizontal';
export declare enum Orientation {
    Top = "top",
    Right = "right",
    Bottom = "bottom",
    Left = "left"
}
declare const OrientationInt: {
    readonly top: 1;
    readonly right: 2;
    readonly bottom: 3;
    readonly left: 4;
};
type OrientationIntValue = (typeof OrientationInt)[OrientationType];
export declare enum Direction {
    Vertical = "vertical",
    Horizontal = "horizontal"
}
export interface AxisSignature {
    Args: {
        scale: Scale;
        orientation: OrientationType;
        tickCount?: number;
        tickValues?: any[];
        tickFormat?: (t: any) => string;
        tickSize?: number;
        tickSizeInner?: number;
        tickSizeOuter?: number;
        tickPadding?: number;
        offset?: number;
        includeDomain?: boolean;
    };
    Blocks: {
        default: [Tick, number];
    };
    Element: SVGGElement;
}
export type Tick = {
    transform: string;
    size: number;
    offset: number;
    textOffset: string;
    label: string;
    textAnchor: string;
    value: any;
};
export default class Axis extends Component<AxisSignature> {
    get tickCount(): number | null;
    get tickValues(): any[] | null;
    get tickFormat(): ((t: any) => string) | null;
    get tickSizeInner(): number;
    get tickSizeOuter(): number;
    get tickPadding(): number;
    get offset(): number;
    get includeDomain(): boolean;
    get orientation(): OrientationIntValue;
    get direction(): DirectionType;
    get position(): (d: number) => number;
    get k(): number;
    get domainPath(): string;
    get values(): any;
    get format(): any;
    get spacing(): number;
    get ticks(): Tick[];
}
export {};
//# sourceMappingURL=axis.d.ts.map