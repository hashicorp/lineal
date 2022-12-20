import { helper } from '@ember/component/helper';
import { ScaleBand, BandScaleConfig } from '../scale';

export default helper(([], hash: BandScaleConfig) => new ScaleBand(hash));
