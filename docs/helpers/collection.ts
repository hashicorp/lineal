/**
 * Simple collection helper functions for use in GJS strict-mode templates.
 */

export function mapBy<T>(key: string, arr: T[]): unknown[] {
  return arr.map((item) => (item as Record<string, unknown>)[key]);
}

export function findBy<T>(
  key: string,
  value: unknown,
  arr: T[],
): T | undefined {
  return arr.find((item) => (item as Record<string, unknown>)[key] === value);
}

export function groupBy<T>(key: string, arr: T[]): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = String((item as Record<string, unknown>)[key]);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

export function range(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}
