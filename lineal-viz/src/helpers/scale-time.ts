import { helper } from '@ember/component/helper';
import { ScaleTime, DateScaleConfig } from '../scale';

export default helper(([], hash: DateScaleConfig) => new ScaleTime(hash));
