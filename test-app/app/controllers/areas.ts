/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';

export default class AreasController extends Controller {
  categories = '0-18 18-25 25-35 35-50 50-70 70+'.split(' ');

  get ageDemo() {
    return [
      { bracket: '0-18', value: 10 },
      { bracket: '18-25', value: 25 },
      { bracket: '25-35', value: 100 },
      { bracket: '35-50', value: 30 },
      { bracket: '50-70', value: 150 },
      { bracket: '70+', value: 40 },
    ];
  }
}
