/**
 * Copyright IBM Corp. 2020, 2026
 * SPDX-License-Identifier: MPL-2.0
 */

import DefaultTheme from 'vitepress/theme';
import CodePreview from 'vite-plugin-ember/components/code-preview.vue';
import type { Theme } from 'vitepress';
import './custom.css';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('CodePreview', CodePreview);
  },
} satisfies Theme;
