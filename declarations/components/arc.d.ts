/**
 * Copyright IBM Corp. 2020, 2026
 */
import Component from '@glimmer/component';
export interface ArcSignature {
    Args: {
        innerRadius?: number | string;
        outerRadius?: number | string;
        cornerRadius?: number | string;
        padRadius?: number | string;
        startAngle?: number | string;
        endAngle?: number | string;
        padAngle?: number | string;
    };
    Blocks: {
        default: [{
            centroid: {
                x: number;
                y: number;
            };
        }];
    };
    Element: SVGPathElement;
}
export default class Arc extends Component<ArcSignature> {
    get startAngle(): number;
    get endAngle(): number;
    get padAngle(): number | undefined;
    get arc(): import("d3-shape").Arc<any, import("d3-shape").DefaultArcObject>;
    get d(): never;
    get centroid(): {
        x: number;
        y: number;
    };
}
//# sourceMappingURL=arc.d.ts.map