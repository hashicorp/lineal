import { helper } from '@ember/component/helper';

function* linearDates(length, options) {
  const { start, step } = Object.assign(
    { start: new Date(), step: 7 },
    options
  );

  let x = start instanceof Date ? start : new Date(start);
  for (let i = 0; i < length; i++) {
    yield { x, y: x };
    x = new Date(+x + step * 24 * 60 * 60 * 1000);
  }
}

export default helper(([length], options) => {
  const gen = linearDates(length, options);
  return Array.from(gen);
});
