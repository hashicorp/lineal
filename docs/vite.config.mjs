/**
 * Copyright IBM Corp. 2020, 2026
 */

import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';
import { kolay } from 'kolay/vite';

export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    // extra plugins here
    kolay({
      src: 'public/docs',
      groups: [],
      packages: ['@lineal-viz/lineal'],
    }),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
  optimizeDeps: {
    // a wasm-providing dependency
    exclude: ['content-tag'],
    // for top-level-await, etc
    esbuildOptions: {
      target: 'esnext',
    },
  },
});
