/**
 * Simple truth helper functions for use in GJS strict-mode templates.
 */

export const and = (...args: unknown[]): unknown =>
  args.reduce((a, b) => (a ? b : a));
export const or = (...args: unknown[]): unknown =>
  args.reduce((a, b) => (a ? a : b));
export const not = (val: unknown): boolean => !val;
export const eq = (a: unknown, b: unknown): boolean => a === b;
export const gt = (a: number, b: number): boolean => a > b;
export const lt = (a: number, b: number): boolean => a < b;
