import { modifier } from 'ember-modifier';
import { Scale } from '../scale';
import { Accessor, Encoding } from '../encoding';
import { bisector } from 'd3-array';

interface InteractorArgs {
  data: any[];
  xScale: Scale;
  x: Accessor;
  y: Accessor | Accessor[];
  distanceThreshold: number;
}

interface ActiveDatum {
  encoding: Encoding;
  datum: any;
}

interface ActiveData {
  datum: ActiveDatum;
  data: ActiveDatum[];
}

export default modifier(
  (element: HTMLElement, [], { data, xScale, x, y, distanceThreshold = 10 }: InteractorArgs) => {
    function seek(ev: MouseEvent) {
      // call onSeek with points
      console.log('seeking', ev);
    }

    function select(ev: MouseEvent) {
      // call onSelect with points
      console.log('selecting', ev);
    }

    function clear(ev: MouseEvent) {
      // call onSeek and onSelect with null
      console.log('clearing', ev);
    }

    function keyControls(ev: KeyboardEvent) {
      console.log('key controls', ev);
    }

    element.addEventListener('mousemove', seek);
    element.addEventListener('click', select);
    element.addEventListener('mouseleave', clear);
    element.addEventListener('keydown', keyControls);

    return () => {
      element.removeEventListener('mousemove', seek);
      element.removeEventListener('click', select);
      element.removeEventListener('mouseleave', clear);
      element.removeEventListener('keydown', keyControls);
    };
  }
);
