import { helper } from '@ember/component/helper';
import { Scale } from '../scale';

export default helper(([scale, value]: [Scale, any]) => scale.compute(value));
