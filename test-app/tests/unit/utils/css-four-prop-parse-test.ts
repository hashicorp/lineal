/**
 * Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: MPL-2.0
 */

import { module } from 'qunit';
import {
  cssFourPropParse,
  FourProp,
} from '@lineal-viz/lineal/utils/css-four-prop-parse';
import tableTest from '../../utils/table-test';

module('Unit | cssFourPropParse', function () {
  tableTest<string, string>(
    [
      {
        name: 'When one value is provided, the returned FourProps has four equal values',
        input: '10',
        output: '10 10 10 10',
      },
      {
        name: 'When two values are provided, the returned FourProps has mirrored top/bottom left/right values',
        input: '10 20',
        output: '10 20 10 20',
      },
      {
        name: 'When three values are provided, the returned FourProps has mirrored left/right values',
        input: '10 20 30',
        output: '10 20 30 20',
      },
      {
        name: 'When four values are provided, the returned FourProps has four independent values',
        input: '10 20 30 40',
        output: '10 20 30 40',
      },
      {
        name: 'When five values are provided, an error is thrown',
        input: '10 20 30 40 50',
        output: null,
      },
      {
        name: 'When units are attached to values, an error is thrown',
        input: '10px 20%',
        output: null,
      },
    ],
    1,
    function (t, assert) {
      const fmt = (props: FourProp) =>
        `${props.top} ${props.right} ${props.bottom} ${props.left}`;

      if (t.output === null) {
        assert.throws(() => cssFourPropParse(t.input));
      } else {
        assert.strictEqual(fmt(cssFourPropParse(t.input)), t.output);
      }
    }
  );
});
