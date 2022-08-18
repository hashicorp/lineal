import { helper } from '@ember/component/helper';
import { ScaleRadial, ScaleConfig } from '../scale';

export default helper(([], hash: ScaleConfig) => new ScaleRadial(hash));
