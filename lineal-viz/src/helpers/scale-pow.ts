import { helper } from '@ember/component/helper';
import { ScalePow, ScaleConfig } from '../scale';

export default helper(([], hash: ScaleConfig) => new ScalePow(hash));
