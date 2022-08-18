import { helper } from '@ember/component/helper';
import { ScaleDivergingLog, DivergingScaleConfig } from '../scale';

export default helper(([], hash: DivergingScaleConfig) => new ScaleDivergingLog(hash));
