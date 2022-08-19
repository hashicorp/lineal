import { helper } from '@ember/component/helper';
import { ScaleQuantile, QuantileScaleConfig } from '../scale';

export default helper(([], hash: QuantileScaleConfig) => new ScaleQuantile(hash));
