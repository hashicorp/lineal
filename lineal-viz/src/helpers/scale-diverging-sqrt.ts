import { helper } from '@ember/component/helper';
import { ScaleDivergingSqrt, DivergingScaleConfig } from '../scale';

export default helper(([], hash: DivergingScaleConfig) => new ScaleDivergingSqrt(hash));
