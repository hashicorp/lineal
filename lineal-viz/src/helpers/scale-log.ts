import { helper } from '@ember/component/helper';
import { ScaleLog, ScaleConfig } from '../scale';

export default helper(([], hash: ScaleConfig) => new ScaleLog(hash));
