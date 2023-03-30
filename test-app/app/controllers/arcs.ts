import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ArcsController extends Controller {
  @tracked activeDatum = null;

  logValue = (...args: any[]) => console.log(...args);
}
