// Used with scales that support discrete ranges (quantize, quantile, threshold, ordinal)
// to dynamically construct ranges that have incrementing strings. These are then used by
// marks to specify encodings as css classes instead of as inline attribute values.
export default class CSSRange {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  spread(count: number): string[] {
    const range = [];
    for (let i = 1; i < count + 1; i++) {
      range.push(`${this.name} ${this.name}-${i} ${this.name}-${count}-${i}`);
    }
    return range;
  }
}
