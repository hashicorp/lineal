import { helper } from '@ember/component/helper';
import CSSRange from '../css-range';

export default helper(([name]: [string]) => new CSSRange(name));
