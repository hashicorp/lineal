import { helper } from '@ember/component/helper';
import { ScaleUtc, DateScaleConfig } from '../scale';

export default helper(([], hash: DateScaleConfig) => new ScaleUtc(hash));
