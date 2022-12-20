import { helper } from '@ember/component/helper';
import { ScalePoint, PointScaleConfig } from '../scale';

export default helper(([], hash: PointScaleConfig) => new ScalePoint(hash));
