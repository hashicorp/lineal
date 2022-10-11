import { helper } from '@ember/component/helper';

export default helper(([input]) => {
  return input != null ? input.toString() : undefined;
});
