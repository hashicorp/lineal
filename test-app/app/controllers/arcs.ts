/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ArcsController extends Controller {
  @tracked activeDatum = null;

  logValue = (...args: any[]) => console.log(...args);
}
