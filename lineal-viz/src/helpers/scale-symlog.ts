import { helper } from '@ember/component/helper';
import { ScaleSymlog, ContinuousScaleConfig } from '../scale';

export default helper(([], hash: ContinuousScaleConfig) => new ScaleSymlog(hash));
