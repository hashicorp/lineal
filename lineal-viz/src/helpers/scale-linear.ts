import { helper } from '@ember/component/helper';
import { ScaleLinear, ScaleConfig } from '../scale';

export default helper(([], hash: ScaleConfig) => new ScaleLinear(hash));
