export type FourProp = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

const UNITLESS_PATTERN = /^\d+( \d+){0,3}$/;

export function cssFourPropParse(str: string): FourProp {
  if (!UNITLESS_PATTERN.test(str)) {
    throw new Error('Cannot parse four prop string. Must be a unitless string of 1 to 4 numbers');
  }

  const parts = str.split(' ').map((p) => +p);

  switch (parts.length) {
    case 1:
      return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
    case 2:
      return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
    case 3:
      return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
    case 4:
      return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    default:
      // Inaccessible
      throw new Error('Four prop string contained more than 4 parts');
  }
}
