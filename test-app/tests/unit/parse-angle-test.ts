/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module } from 'qunit';
import parseAngle from '@lineal-viz/lineal/utils/parse-angle';
import tableTest from '../utils/table-test';

const radian = (d: number): number => (d * Math.PI) / 180;

module('Unit | parseAngle', function () {
  tableTest<string | number, number>(
    [
      {
        name: 'Numeric strings ending with a "d" are parsed as base 10 numbers representing degrees and returned as radians',
        input: '5d',
        output: radian(5),
      },
      {
        name: 'Fractional numbers are supported',
        input: '45.5d',
        output: radian(45.5),
      },
      {
        name: 'Negative numbers are supported',
        input: '-45d',
        output: radian(-45),
      },
      {
        name: 'When a string does not end with a "d" an error is thrown',
        input: '50',
        output: null,
      },
      {
        name: 'When the input is already a number, the same number is returned',
        input: Math.PI,
        output: Math.PI,
      },
    ],
    1,
    function (t, assert) {
      if (t.output === null) {
        assert.throws(() => {
          parseAngle(t.input);
        });
      } else {
        assert.strictEqual(parseAngle(t.input), t.output);
      }
    }
  );
});
