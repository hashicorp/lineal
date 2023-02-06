import { helper } from '@ember/component/helper';

function* linear(length, options) {
  const { start, step } = Object.assign({ start: 0, step: 10 }, options);

  let x = start;
  for (let i = 0; i < length; i++) {
    yield { x, y: x };
    x += step;
  }
}

export default helper(([length], options) => {
  const gen = linear(length, options);
  return Array.from(gen);
});
