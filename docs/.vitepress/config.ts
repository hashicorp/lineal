/**
 * Copyright IBM Corp. 2020, 2026
 * SPDX-License-Identifier: MPL-2.0
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitepress';
import vitePluginEmber, { emberFence } from 'vite-plugin-ember';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  title: 'Lineal',
  description: 'A template-first data visualization toolkit for Ember',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/intro/welcome' },
      { text: 'Concepts', link: '/concepts/scales' },
      { text: 'Dev Logs', link: '/dev-logs/one' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [{ text: 'Welcome', link: '/intro/welcome' }],
      },
      {
        text: 'Concepts',
        items: [
          { text: 'Scales', link: '/concepts/scales' },
          { text: 'Marks', link: '/concepts/marks' },
          { text: 'Visual Elements', link: '/concepts/visual-elements' },
          { text: 'Interactors', link: '/concepts/interactors' },
          { text: 'Fluid', link: '/concepts/fluid' },
        ],
      },
      {
        text: 'Dev Logs',
        items: [
          { text: '01: Scales & Marks', link: '/dev-logs/one' },
          { text: '02: Making a Line Chart', link: '/dev-logs/two' },
          { text: '03: Interactivity', link: '/dev-logs/three' },
          { text: '04: More Scale and More Marks', link: '/dev-logs/four' },
          { text: '05: Learning Lineal', link: '/dev-logs/five' },
          { text: '06: Stacks', link: '/dev-logs/six' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hashicorp/lineal' },
    ],
  },

  vite: {
    plugins: [vitePluginEmber()],
    resolve: {
      extensions: [
        '.mjs',
        '.js',
        '.mts',
        '.ts',
        '.jsx',
        '.tsx',
        '.json',
        '.gts',
        '.gjs',
      ],
      alias: {
        '~docs': path.resolve(__dirname, '..'),
        '@lineal-viz/lineal': path.resolve(__dirname, '../../dist'),
      },
    },
    ssr: {
      noExternal: [/vite-plugin-ember/],
    },
  },

  markdown: {
    config(md) {
      emberFence(md);
    },
  },
});
