/**
 * Copyright IBM Corp. 2020, 2026
 */

/**
 * Converts a well-formed degrees string into radians or passes through radians
 * if provided with numberic input.
 *
 * ```
 * console.log(parseAngle('180d'); // 3.141592653589793
 * console.log(parseAngle(Math.PI); // 3.141592653589793
 * ```
 *
 * @param angle - When a number, the number is assumed to be radians and is returned as is.
 *                When a string, the number is parsed as degrees and converted to radians
 *                as long as the string ends in a lower-case 'd'.
 * @throws - When the string `angle` is malformed.
 * @returns - The provided angle as radians.
 */
function parseAngle(angle) {
  if (typeof angle === 'number') return angle;
  const PATTERN = /^(-?\d+\.?\d*)d$/;
  if (!PATTERN.test(angle)) {
    throw new Error(`Could not parse string "${angle}" as degrees. To provide an angle as degrees end a string with a lower-case "d", like "180d". If the angle provided is radians, make sure to pass it as a number in templates, like @angle={{this.angle}}`);
  }
  const degrees = parseFloat(angle.match(PATTERN)?.[1] ?? '0');
  return degrees * Math.PI / 180;
}

export { parseAngle as default };
//# sourceMappingURL=parse-angle.js.map
