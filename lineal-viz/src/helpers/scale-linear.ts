import { helper } from '@ember/component/helper';
import { ScaleLinear, ContinuousScaleConfig } from '../scale';

export default helper(([], hash: ContinuousScaleConfig) => new ScaleLinear(hash));
