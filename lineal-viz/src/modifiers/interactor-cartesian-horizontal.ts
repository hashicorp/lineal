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

enum NavKey {
  ESC = 'Escape',
  Enter = 'Enter',
  Space = ' ',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',
}

const NAV_KEYS = Object.values(NavKey);

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

    let activeData: ActiveData | null = null;
    let seekIndex: number = 0;

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

    function setState(points: ActiveData | null) {
      activeData = points;

      const datum = points?.datum.datum;
      seekIndex = data.indexOf(datum);
    }

    function seek(ev: MouseEvent) {
      const points = getDataAtPoint(ev.offsetX);
      setState(points);
      onSeek?.(points);
    }

    function select(ev: MouseEvent) {
      const points = getDataAtPoint(ev.offsetX);
      setState(points);
      onSelect?.(points ? points.datum : null);
    }

    function clear() {
      activeData = null;
      onSeek?.(null);
      onSelect?.(null);
    }

    function keyControls(ev: KeyboardEvent) {
      const key: NavKey = ev.key as NavKey;

      if (NAV_KEYS.includes(key)) {
        ev.preventDefault();
      }

      if (key === NavKey.Space || key === NavKey.Enter) {
        onSelect?.(activeData ? activeData.datum : null);
      } else if (key === NavKey.ESC) {
        onSeek?.(null);
        onSelect?.(null);
      } else if (key === NavKey.Right) {
        seekIndex = (seekIndex + 1) % data.length;
      } else if (key === NavKey.Left) {
        seekIndex--;
        if (seekIndex < 0) seekIndex = data.length - 1;
      }

      if (key === NavKey.Right || key === NavKey.Left) {
        const points = getDataAtPoint(xScale.compute(xEnc.accessor(data[seekIndex])));
        setState(points);
        onSeek?.(points);
      }
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
