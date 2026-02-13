/**
 * Copyright IBM Corp. 2020, 2026
 */
interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface BorderRadius {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
}
/**
 * A function that takes the bounding box of a rectangle along with all four
 * border radii and generates a valid SVG path string with the correct lines
 * and arcs.
 *
 * @param rect - The rectangle to round.
 * @param radii - The four radii for the rectangle.
 * @param safe - When true, radii are clipped to never exceed width/height.
 * @returns - A valid SVG path string (to use as a `d` attribute value)
 */
export declare function roundedRect(rect: Rect, radii: BorderRadius, safe?: boolean): string;
export {};
//# sourceMappingURL=rounded-rect.d.ts.map