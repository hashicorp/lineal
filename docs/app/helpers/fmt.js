import { helper } from '@ember/component/helper';

const fmtNumber = Intl.NumberFormat('default', { maximumSignificantDigits: 2 });
const fmtDate = Intl.DateTimeFormat();

export default helper(([value]) => {
  if (typeof value === 'string') return value;

  if (typeof value === 'number') return fmtNumber.format(value);
  if (value instanceof Date) return fmtDate.format(value);

  throw new Error('Bad input!');
});
