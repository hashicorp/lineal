/**
 * Copyright IBM Corp. 2020, 2026
 */
import Component from '@glimmer/component';
import type { Scale } from '../utils/scale.ts';
export type DirectionType = 'vertical' | 'horizontal';
export declare enum Direction {
    Vertical = "vertical",
    Horizontal = "horizontal"
}
export interface GridLinesSignature {
    Args: {
        scale: Scale;
        direction: DirectionType;
        length: number | string;
        lineCount?: number;
        lineValues?: any[];
        offset?: number;
    };
    Blocks: {
        default: [];
    };
    Element: SVGGElement;
}
export default class GridLines extends Component<GridLinesSignature> {
    get lineValues(): any[] | null;
    get lineCount(): number | null;
    get offset(): number;
    get values(): any;
    get position(): (d: number) => number;
    get lines(): any;
}
//# sourceMappingURL=grid-lines.d.ts.map