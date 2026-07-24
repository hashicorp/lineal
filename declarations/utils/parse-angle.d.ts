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
export default function parseAngle(angle: number | string): number;
//# sourceMappingURL=parse-angle.d.ts.map