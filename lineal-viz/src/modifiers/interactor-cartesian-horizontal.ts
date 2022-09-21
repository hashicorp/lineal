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
  onSeek?: (data: ActiveData | null) => void;
  onSelect?: (datum: ActiveDatum | null) => void;
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
  (
    element: HTMLElement,
    [],
    { data, xScale, x, y, onSeek, onSelect, distanceThreshold = 10 }: InteractorArgs
  ) => {
    const accessors: Accessor[] = y instanceof Array ? y : [y];
    const xEnc = new Encoding(x);
    const yEncs = accessors.map((y) => new Encoding(y));
    const bis = bisector((d) => xEnc.accessor(d)).left;

    function getDataAtPoint(pt: number): ActiveData | null {
      // Exit early when possible
      if (!data.length) return null;

      // Map the pixel-space value to the data-space value
      const dx = xScale.d3Scale.invert(pt);

      // For each y encoding, find the nearest datum to the data-space value
      const activeData: ActiveDatum[] = yEncs.reduce((agg: ActiveDatum[], encoding) => {
        // Only bisect data that has values for the current y encoding
        const subjectData = data.filter((d) => encoding.accessor(d) != null);

        if (!subjectData.length) return agg;

        const index = bis(subjectData, dx, 1);
        const dLeft = subjectData[index - 1];
        const dRight = subjectData[index];

        let datum;

        // If there is only one datum, it's the active datum
        if (dLeft && !dRight) {
          datum = dLeft;
        } else {
          // Pick the closer datum
          datum = dx - xEnc.accessor(dLeft) > xEnc.accessor(dRight) - dx ? dRight : dLeft;
        }

        agg.push({ encoding, datum });
        return agg;
      }, []);

      // Now determine which of the active data is closest
      const closestDatum = activeData
        .slice()
        .sort(
          (a, b) => Math.abs(xEnc.accessor(a.datum) - dx) - Math.abs(xEnc.accessor(b.datum) - dx)
        )[0];

      // Finally filter out active data based on a pixel-space distance threshold
      const dist: number = Math.abs(xScale.compute(xEnc.accessor(closestDatum.datum)) - pt);
      const filteredData = activeData.filter(
        (d) => Math.abs(xScale.compute(xEnc.accessor(d.datum)) - pt) < dist + distanceThreshold
      );

      return {
        datum: closestDatum,
        data: filteredData,
      };
    }

    function seek(ev: MouseEvent) {
      const points = getDataAtPoint(ev.offsetX);
      onSeek?.(points);
    }

    function select(ev: MouseEvent) {
      // call onSelect with points
      console.log('selecting', ev);
    }

    function clear(ev: MouseEvent) {
      onSeek?.(null);
      onSelect?.(null);
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
  },
  { eager: false }
);
