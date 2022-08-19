import { helper } from '@ember/component/helper';
import { ScaleOrdinal, OrdinalScaleConfig } from '../scale';

export default helper(([], hash: OrdinalScaleConfig) => new ScaleOrdinal(hash));
