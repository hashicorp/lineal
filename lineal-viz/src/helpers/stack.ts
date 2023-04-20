import { helper } from '@ember/component/helper';
import Stack, { StackConfig } from '../transforms/stack';

export default helper(([], hash: StackConfig) => new Stack(hash));
