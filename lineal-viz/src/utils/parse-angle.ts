// An angle can be defined as a number or a string ending with 'd'
export default function parseAngle(angle: number | string): number {
  if (typeof angle === 'number') return angle;

  const PATTERN = /^(-?\d+\.?\d*)d$/;

  if (!PATTERN.test(angle)) {
    throw new Error(
      `Could not parse string "${angle}" as degrees. To provide an angle as degrees end a string with a lower-case "d", like "180d". If the angle provided is radians, make sure to pass it as a number in templates, like @angle={{this.angle}}`
    );
  }

  const degrees = parseFloat(angle.match(PATTERN)?.[1] ?? '0');
  return (degrees * Math.PI) / 180;
}
