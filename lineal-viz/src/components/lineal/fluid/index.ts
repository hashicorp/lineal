import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

interface FluidArgs {}

export default class Fluid extends Component<FluidArgs> {
  @tracked width: number = 0;
  @tracked height: number = 10;
  @tracked entry: ResizeObserverEntry | undefined;

  @action
  onResize(entry: ResizeObserverEntry) {
    this.width = entry.contentRect.width;
    this.height = entry.contentRect.height;
    this.entry = entry;
  }
}
