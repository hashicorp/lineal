/**
 * Copyright IBM Corp. 2022, 2023
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

// A clockwise-turning small arc with two radii. Since this is clockwise turning,
// The radii are broken down as first and second radii components instead of vertical
// and horizontal components. This means it is up to the caller to determine if the radii
// order should be v,h or h,v based on the corner being drawn.
const arc = (rx: number, ry: number, hDir: number, vDir: number) =>
  `a ${rx},${ry} 0 0 1 ${rx * hDir},${ry * vDir}`;

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
export function roundedRect(rect: Rect, radii: BorderRadius, safe = false): string {
  let rtrx = radii.topRight;
  let rbrx = radii.bottomRight;
  let rblx = radii.bottomLeft;
  let rtlx = radii.topLeft;
  let rtry = rtrx;
  let rbry = rbrx;
  let rbly = rblx;
  let rtly = rtlx;

  // When creating a safe roundedRect, radii that exceed the width or height of the rectangle
  // are truncated. This can result in oblong radii which is why the four radii are expanded into
  // eight total variables (splitting radii into vertical and horizontal components).
  if (safe) {
    if (rtrx + rtlx > rect.width) {
      const rsum = rtrx + rtlx;
      rtrx = (rect.width * rtrx) / rsum;
      rtlx = (rect.width * rtlx) / rsum;
    }

    if (rtry + rbry > rect.height) {
      const rsum = rtry + rbry;
      rtry = (rect.height * rtry) / rsum;
      rbry = (rect.height * rbry) / rsum;
    }

    if (rbrx + rblx > rect.width) {
      const rsum = rbrx + rblx;
      rbrx = (rect.width * rbrx) / rsum;
      rblx = (rect.width * rblx) / rsum;
    }

    if (rbly + rtly > rect.height) {
      const rsum = rbly + rtly;
      rbly = (rect.height * rbly) / rsum;
      rtly = (rect.height * rtly) / rsum;
    }
  }

  return [
    move(rect.x, rect.y + rtly),
    arc(rtlx, rtly, 1, -1),
    hLine(rect.width - rtlx - rtrx),
    arc(rtrx, rtry, 1, 1),
    vLine(rect.height - rtry - rbry),
    arc(rbrx, rbry, -1, 1),
    hLine(-rect.width + rbrx + rblx),
    arc(rblx, rbly, -1, -1),
    vLine(-rect.height + rbly + rtly),
    'Z',
  ].join(' ');
}
