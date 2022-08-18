import { helper } from '@ember/component/helper';
import { ScaleSqrt, ScaleConfig } from '../scale';

export default helper(([], hash: ScaleConfig) => new ScaleSqrt(hash));
