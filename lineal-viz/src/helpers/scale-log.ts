import { helper } from '@ember/component/helper';
import { ScaleLog, LogScaleConfig } from '../scale';

export default helper(([], hash: LogScaleConfig) => new ScaleLog(hash));
