import { test } from 'qunit';

interface TableTest<U, V> {
  name: string;
  input: U;
  output?: V | null;
}

export default function tableTest<U, V>(
  input: TableTest<U, V>[],
  count: number,
  fn: (t: TableTest<U, V>, assert: Assert) => void
) {
  for (const t of input) {
    test(t.name, function (assert) {
      assert.expect(count);
      fn(t, assert);
    });
  }
}
