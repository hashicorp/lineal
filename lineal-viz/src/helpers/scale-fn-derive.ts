import { helper } from '@ember/component/helper';
import { Scale } from '../scale';

export default helper(([scale]: [Scale], config: object) => scale.derive(config));
