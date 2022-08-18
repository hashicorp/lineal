import { helper } from '@ember/component/helper';
import { ScaleDivergingSymlog, DivergingScaleConfig } from '../scale';

export default helper(([], hash: DivergingScaleConfig) => new ScaleDivergingSymlog(hash));
