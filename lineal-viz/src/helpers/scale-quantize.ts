import { helper } from '@ember/component/helper';
import { ScaleQuantize, QuantizeScaleConfig } from '../scale';

export default helper(([], hash: QuantizeScaleConfig) => new ScaleQuantize(hash));
