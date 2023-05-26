/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

'use strict';

module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-prettier/recommended'],
  rules: {
    'selector-class-pattern': [
      '^([a-z][a-z0-9]*)((--?|__)[a-z0-9]+)*$',
      { message: 'Expected class to use kebab-case or BEM' },
    ],
    'declaration-block-single-line-max-declarations': 2,
  },
};
