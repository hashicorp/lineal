/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { ScaleTime } from '@lineal-viz/lineal/scale';

function* sine(length: number, start = 0) {
  let x = start;
  const max = start + length * 200;
  while (x < max) {
    yield { x: new Date(x), y: Math.sin(x) * 10 };
    x += 200;
  }
}

export default class ReactivityController extends Controller {
  @tracked wave: any[] = [];
  @tracked xScale = new ScaleTime({ range: '0..800' });

  constructor() {
    super();
    setInterval(() => {
      this.wave = Array.from(sine(100, Date.now()));
      // This third argument isn't in Lineal. It's used to
      // force an update to the domain, since normally qualify
      // only does something if the min or max are still undefined
      //this.xScale.domain.qualify(this.wave, 'x', true);
    }, 100);
  }
}
