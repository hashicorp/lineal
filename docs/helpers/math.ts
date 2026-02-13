/**
 * Simple math helper functions for use in GJS strict-mode templates.
 */

export const mod = (a: number, b: number): number => a % b;
export const div = (a: number, b: number): number => a / b;
export const sub = (a: number, b: number): number => a - b;
export const min = (...args: number[]): number => Math.min(...args);
export const inc = (n: number): number => n + 1;
