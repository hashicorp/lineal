/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const path = require('path');
const autolinkHeadings = require('remark-autolink-headings');
const highlight = require('remark-highlight.js');
const codeImport = require('remark-code-import');

module.exports = {
  remarkPlugins: [
    [autolinkHeadings, { behavior: 'wrap' }],
    codeImport,
    highlight,
  ],
  sources: [
    {
      root: path.join(__dirname, 'docs'),
      pattern: '**/*.md',
      urlPrefix: 'docs',
    },
  ],
  labels: {
    'dev-logs': 'Dev Logs',
    concepts: 'Concepts',
  },
};
