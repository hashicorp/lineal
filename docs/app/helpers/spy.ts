/**
 * Copyright IBM Corp. 2020, 2026
 */

type SpyFn = (...args: unknown[]) => unknown;

// In Ember 4 you can call functions like helpers, which is great for
// calling spies in templates. However, for 3.x ember-try compat, we
// do this instead.
export default function spy(
  spyFn: SpyFn,
  ...positional: unknown[]
): (...opts: unknown[]) => void {
  return (...opts: unknown[]) => {
    const args = [...positional, ...opts];
    spyFn(...args);
  };
}
