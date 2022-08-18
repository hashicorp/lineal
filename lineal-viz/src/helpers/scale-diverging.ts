import { helper } from '@ember/component/helper';
import { ScaleDiverging, DivergingScaleConfig } from '../scale';

export default helper(([], hash: DivergingScaleConfig) => new ScaleDiverging(hash));
