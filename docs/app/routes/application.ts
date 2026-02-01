/**
 * Copyright IBM Corp. 2020, 2026
 */

import Route from '@ember/routing/route';
import { setupKolay } from 'kolay/setup';

import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

import type { Manifest } from 'kolay';

export default class ApplicationRoute extends Route {
  async model(): Promise<{ manifest: Manifest }> {
    const highlighter = await createHighlighterCore({
      themes: [
        import('shiki/themes/github-dark.mjs'),
        import('shiki/themes/github-light.mjs'),
      ],
      langs: [
        import('shiki/langs/javascript.mjs'),
        import('shiki/langs/typescript.mjs'),
        import('shiki/langs/bash.mjs'),
        import('shiki/langs/css.mjs'),
        import('shiki/langs/html.mjs'),
        import('shiki/langs/glimmer-js.mjs'),
        import('shiki/langs/glimmer-ts.mjs'),
        import('shiki/langs/handlebars.mjs'),
        import('shiki/langs/jsonc.mjs'),
      ],
      engine: createOnigurumaEngine(() => import('shiki/wasm')),
    });

    const [manifest] = await Promise.all([
      setupKolay(this, {
        modules: {
          kolay: () => import('kolay'),
          'ember-primitives': () => import('ember-primitives'),
          '@lineal-viz/lineal': () => import('@lineal-viz/lineal'),
        },
        rehypePlugins: [
          [
            rehypeShikiFromHighlighter,
            highlighter,
            {
              defaultColor: 'light',
              themes: {
                light: 'github-light',
                dark: 'github-dark',
              },
            },
          ],
        ],
      }),
    ]);

    return { manifest };
  }
}
