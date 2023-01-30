import { helper } from '@ember/component/helper';
import { ScaleSqrt, ContinuousScaleConfig } from '../scale';

export default helper(([], hash: ContinuousScaleConfig) => new ScaleSqrt(hash));
