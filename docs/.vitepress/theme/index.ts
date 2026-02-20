/**
 * Copyright IBM Corp. 2020, 2026
 * SPDX-License-Identifier: MPL-2.0
 */

import DefaultTheme from 'vitepress/theme';
import { setupEmber } from 'vite-plugin-ember/setup';
import type { Theme } from 'vitepress';
import './custom.css';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    setupEmber(app);
  },
} satisfies Theme;
