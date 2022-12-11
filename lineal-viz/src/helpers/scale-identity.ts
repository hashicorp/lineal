import { helper } from '@ember/component/helper';
import { ScaleIdentity, IdentityScaleConfig } from '../scale';

export default helper(([], hash: IdentityScaleConfig) => new ScaleIdentity(hash));
