import { helper } from '@ember/component/helper';
import { ScalePow, PowScaleConfig } from '../scale';

export default helper(([], hash: PowScaleConfig) => new ScalePow(hash));
