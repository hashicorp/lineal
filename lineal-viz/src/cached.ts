import 'ember-cached-decorator-polyfill';
import { cached as originalCached } from '@glimmer/tracking';

/* This is a bit of a hack to guarantee that @cached is available throughout this addon
 * regardless of how the consuming Ember app is building its dependencies. Right now it's
 * possible in Ember 3.x without building with Embroider for cached from @glimmer/tracking
 * to be undefined due to some babel shenanigans Ember uses for compatibility with non-module
 * "modules", such as `@glimmer/tracking` which gets rewritten to import from Ember itself.
 *
 * The downside is that `noop` doesn't cache at all, it's just a passthrough decorator meant
 * to maintain compatibility.
 *
 * Tracking issue: https://github.com/ef4/ember-auto-import/issues/536
 */
function noop(...args: any[]): void {
  // noop, simple passthrough
}

export const cached = originalCached || noop;
