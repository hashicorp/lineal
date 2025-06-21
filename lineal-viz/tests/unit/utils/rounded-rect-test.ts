/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module } from 'qunit';
import { roundedRect } from '#src/utils/rounded-rect.ts';
import tableTest from '../../helpers/table-test.ts';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BorderRadius {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
}

const b = (x: number, y: number, width: number, height: number) => ({
  x,
  y,
  width,
  height,
});

const r = (
  topLeft: number,
  topRight: number,
  bottomRight: number,
  bottomLeft: number,
) => ({ topLeft, topRight, bottomRight, bottomLeft });

module('Unit | roundedRect', function () {
  tableTest<[Rect, BorderRadius], string>(
    [
      {
        name: 'A rectangle with no border radii creates a path with arcs with sharp angles',
        input: [b(0, 0, 100, 100), r(0, 0, 0, 0)],
        output:
          'M 0,0 a 0,0 0 0 1 0,0 h 100 a 0,0 0 0 1 0,0 v 100 a 0,0 0 0 1 0,0 h -100 a 0,0 0 0 1 0,0 v -100 Z',
      },
      {
        name: 'A rectangle with even border radii creates uniform corners, accounting for the corner size in drawn lines',
        input: [b(0, 0, 100, 100), r(8, 8, 8, 8)],
        output:
          'M 0,8 a 8,8 0 0 1 8,-8 h 84 a 8,8 0 0 1 8,8 v 84 a 8,8 0 0 1 -8,8 h -84 a 8,8 0 0 1 -8,-8 v -84 Z',
      },
      {
        name: 'A rectangle with uneven border radii creates uneven corners but respects the initial height and width',
        input: [b(0, 0, 100, 100), r(8, 22, 9, 0)],
        output:
          'M 0,8 a 8,8 0 0 1 8,-8 h 70 a 22,22 0 0 1 22,22 v 69 a 9,9 0 0 1 -9,9 h -91 a 0,0 0 0 1 0,0 v -92 Z',
      },
      {
        name: 'An irregular rectangle with even border radii respects the initial height and width',
        input: [b(0, 0, 300, 50), r(10, 10, 10, 10)],
        output:
          'M 0,10 a 10,10 0 0 1 10,-10 h 280 a 10,10 0 0 1 10,10 v 30 a 10,10 0 0 1 -10,10 h -280 a 10,10 0 0 1 -10,-10 v -30 Z',
      },
      {
        name: 'A rectangle positioned offset from the 0,0 origin draws a correct rectangle using delta instructions h, v, and a',
        input: [b(100, 200, 300, 50), r(10, 10, 10, 10)],
        output:
          'M 100,210 a 10,10 0 0 1 10,-10 h 280 a 10,10 0 0 1 10,10 v 30 a 10,10 0 0 1 -10,10 h -280 a 10,10 0 0 1 -10,-10 v -30 Z',
      },
      {
        name: 'A rectangle with radii that sum larger than the dimensions of the provided rectangle faithfully creates a path despite the expected rendering glitches',
        input: [b(0, 0, 75, 50), r(40, 40, 40, 40)],
        output:
          'M 0,40 a 40,40 0 0 1 40,-40 h -5 a 40,40 0 0 1 40,40 v -30 a 40,40 0 0 1 -40,40 h 5 a 40,40 0 0 1 -40,-40 v 30 Z',
      },
    ],
    1,
    function (t, assert) {
      if (t.output === null) {
        assert.throws(() => {
          roundedRect(...t.input);
        });
      } else {
        assert.strictEqual(roundedRect(...t.input), t.output);
      }
    },
  );

  tableTest<[Rect, BorderRadius], string>(
    [
      {
        name: 'The safe directive does nothing when radii are 0',
        input: [b(0, 0, 100, 100), r(0, 0, 0, 0)],
        output:
          'M 0,0 a 0,0 0 0 1 0,0 h 100 a 0,0 0 0 1 0,0 v 100 a 0,0 0 0 1 0,0 h -100 a 0,0 0 0 1 0,0 v -100 Z',
      },
      {
        name: 'The safe directive does nothing when radii total less than width/height',
        input: [b(0, 0, 100, 100), r(8, 8, 8, 8)],
        output:
          'M 0,8 a 8,8 0 0 1 8,-8 h 84 a 8,8 0 0 1 8,8 v 84 a 8,8 0 0 1 -8,8 h -84 a 8,8 0 0 1 -8,-8 v -84 Z',
      },
      {
        name: 'The safe directive shrinks radii only when necessary',
        input: [b(0, 0, 100, 100), r(60, 60, 60, 60)],
        output:
          'M 0,50 a 50,50 0 0 1 50,-50 h 0 a 50,50 0 0 1 50,50 v 0 a 50,50 0 0 1 -50,50 h 0 a 50,50 0 0 1 -50,-50 v 0 Z',
      },
      {
        name: 'The safe directive shrinks x/y radii for each corner independently',
        input: [b(0, 0, 100, 30), r(40, 40, 0, 0)],
        output:
          'M 0,30 a 40,30 0 0 1 40,-30 h 20 a 40,30 0 0 1 40,30 v 0 a 0,0 0 0 1 0,0 h -100 a 0,0 0 0 1 0,0 v 0 Z',
      },
      {
        name: 'The safe directive shrinks radii proportionally when the width/height is too small',
        input: [b(0, 0, 100, 100), r(90, 30, 90, 30)],
        output:
          'M 0,75 a 75,75 0 0 1 75,-75 h 0 a 25,25 0 0 1 25,25 v 0 a 75,75 0 0 1 -75,75 h 0 a 25,25 0 0 1 -25,-25 v 0 Z',
      },
    ],
    1,
    function (t, assert) {
      assert.strictEqual(roundedRect.apply(null, [...t.input, true]), t.output);
    },
  );
});
