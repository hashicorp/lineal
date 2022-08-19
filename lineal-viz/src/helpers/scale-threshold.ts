import { helper } from '@ember/component/helper';
import { ScaleThreshold, QuantileScaleConfig } from '../scale';

export default helper(([], hash: QuantileScaleConfig) => new ScaleThreshold(hash));
