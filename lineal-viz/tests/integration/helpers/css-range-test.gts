/**
 * Copyright IBM Corp. 2020, 2026
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { spy } from 'sinon';
import cssRange from '#src/helpers/css-range.ts';
import CSSRange from '#src/utils/css-range.ts';
import spyHelper from '#tests/helpers/spy.ts';

module('Integration | helpers | css-range', function (hooks) {
  setupRenderingTest(hooks);

  test('css-range creates a CSSRange instance with the provided name', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let (cssRange "color-scheme") as |range|}}
          {{spyHelper spyFn range}}
        {{/let}}
      </template>,
    );

    const range = spyFn.getCall(0).args[0];
    assert.ok(range instanceof CSSRange, 'creates a CSSRange instance');
    assert.strictEqual(range.name, 'color-scheme', 'has the correct name');
  });

  test('css-range spread method returns CSS class names', async function (assert) {
    const spyFn = spy();

    await render(
      <template>
        {{#let (cssRange "theme") as |range|}}
          {{spyHelper spyFn range}}
        {{/let}}
      </template>,
    );

    const range = spyFn.getCall(0).args[0] as CSSRange;
    const spread = range.spread(3);

    assert.strictEqual(
      spread.length,
      3,
      'spread returns correct number of items',
    );
    assert.deepEqual(
      spread,
      [
        'theme theme-1 theme-3-1',
        'theme theme-2 theme-3-2',
        'theme theme-3 theme-3-3',
      ],
      'spread returns correctly formatted class names',
    );
  });
});
