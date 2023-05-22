/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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

// Start drawing at x, y
const move = (x: number, y: number) => `M ${x},${y}`;

// Draw lines using y and x as deltas instead of coordinates
const vLine = (y: number) => `v ${y}`;
const hLine = (x: number) => `h ${x}`;

// A clockwise-turning small arc with equal radii
const arc = (r: number, hDir: number, vDir: number) => `a ${r},${r} 0 0 1 ${r * hDir},${r * vDir}`;

/**
 * A function that takes the bounding box of a rectangle along with all four
 * border radii and generates a valid SVG path string with the correct lines
 * and arcs.
 *
 * @param rect - The rectangle to round.
 * @param radii - The four radii for the rectangle.
 * @returns - A valid SVG path string (to use as a `d` attribute value)
 */
export function roundedRect(rect: Rect, radii: BorderRadius): string {
  return [
    move(rect.x, rect.y + radii.topLeft),
    arc(radii.topLeft, 1, -1),
    hLine(rect.width - radii.topLeft - radii.topRight),
    arc(radii.topRight, 1, 1),
    vLine(rect.height - radii.topRight - radii.bottomRight),
    arc(radii.bottomRight, -1, 1),
    hLine(-rect.width + radii.bottomRight + radii.bottomLeft),
    arc(radii.bottomLeft, -1, -1),
    vLine(-rect.height + radii.bottomLeft + radii.topLeft),
    'Z',
  ].join(' ');
}
