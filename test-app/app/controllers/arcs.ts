/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { roundedRect } from '@lineal-viz/lineal/utils/rounded-rect';

export default class ArcsController extends Controller {
  @tracked activeDatum = null;

  logValue = (...args: any[]) => console.log(...args);

  rrect = (rect: string, radii: string) => {
    const [x, y, width, height] = rect.split(' ').map((d) => +d);
    const [topLeft, topRight, bottomLeft, bottomRight] = radii
      .split(' ')
      .map((d) => +d);
    return roundedRect(
      { x: x ?? 0, y: y ?? 0, width: width ?? 0, height: height ?? 0 },
      {
        topLeft: topLeft ?? 0,
        topRight: topRight ?? 0,
        bottomLeft: bottomLeft ?? 0,
        bottomRight: bottomRight ?? 0,
      },
      true
    );
  };
}
