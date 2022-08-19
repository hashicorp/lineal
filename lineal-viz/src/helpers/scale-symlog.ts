import { helper } from '@ember/component/helper';
import { ScaleSymlog, ScaleConfig } from '../scale';

export default helper(([], hash: ScaleConfig) => new ScaleSymlog(hash));
