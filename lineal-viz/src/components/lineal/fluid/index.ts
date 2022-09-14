import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

interface FluidArgs {}

export default class Fluid extends Component<FluidArgs> {
  @tracked width = 0;
  @tracked height = 10;

  @action
  onResize(entry: ResizeObserverEntry) {
    this.width = entry.contentRect.width;
    this.height = entry.contentRect.height;
  }
}
