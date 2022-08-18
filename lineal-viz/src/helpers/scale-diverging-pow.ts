import { helper } from '@ember/component/helper';
import { ScaleDivergingPow, DivergingScaleConfig } from '../scale';

export default helper(([], hash: DivergingScaleConfig) => new ScaleDivergingPow(hash));
