/**
 * Copyright IBM Corp. 2020, 2026
 */

export default function str(
  input: string | number | boolean | null | undefined,
): string | undefined {
  return input != null ? String(input) : undefined;
}
