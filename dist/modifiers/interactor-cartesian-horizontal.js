import { modifier } from 'ember-modifier';
import { bisector } from 'd3-array';
import { Encoding } from '../utils/encoding.js';

/**
 * Copyright IBM Corp. 2020, 2026
 */


/**
 * The available arguments to the `interactor-cartesian-horizontal` modifier.
 */
var NavKey = /*#__PURE__*/function (NavKey) {
  NavKey["ESC"] = "Escape";
  NavKey["Enter"] = "Enter";
  NavKey["Space"] = " ";
  NavKey["Left"] = "ArrowLeft";
  NavKey["Right"] = "ArrowRight";
  return NavKey;
}(NavKey || {});
const NAV_KEYS = Object.values(NavKey);
var interactorCartesianHorizontal = modifier((element, _, {
  data,
  xScale,
  x,
  y,
  onSeek,
  onSelect,
  distanceThreshold = 10
}) => {
  const accessors = y instanceof Array ? y : [y];
  const xEnc = new Encoding(x);
  const yEncs = accessors.map(y => new Encoding(y));
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const bis = bisector(d => xEnc.accessor(d)).left;
  let activeData = null;
  let seekIndex = 0;
  function getDataAtPoint(pt) {
    // Exit early when possible
    if (!data.length) return null;

    // Map the pixel-space value to the data-space value
    const dx = xScale.d3Scale.invert(pt);

    // For each y encoding, find the nearest datum to the data-space value
    const activeData = yEncs.reduce((agg, encoding) => {
      // Only bisect data that has values for the current y encoding
      const subjectData = data.filter(d => encoding.accessor(d) != null);
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

      // Collect all data with the same x value as the active datum (generally means a
      // multi-series dataset).
      const matchVal = xEnc.accessor(datum);
      const relatedData = subjectData.filter(d => xEnc.accessor(d) === matchVal);
      agg.push(...relatedData.map(datum => ({
        encoding,
        datum
      })));
      return agg;
    }, []);

    // Now determine which of the active data is closest
    const closestDatum = activeData.slice().sort((a, b) => Math.abs(xEnc.accessor(a.datum) - dx) - Math.abs(xEnc.accessor(b.datum) - dx))[0];

    // Return null if no closest datum found
    if (!closestDatum) {
      return null;
    }

    // Finally filter out active data based on a pixel-space distance threshold
    const dist = Math.abs(xScale.compute(xEnc.accessor(closestDatum.datum)) - pt);
    const filteredData = activeData.filter(d => Math.abs(xScale.compute(xEnc.accessor(d.datum)) - pt) < dist + distanceThreshold);
    return {
      datum: closestDatum,
      data: filteredData
    };
  }
  function setState(points) {
    activeData = points;
    const datum = points?.datum.datum;
    seekIndex = data.indexOf(datum);
  }
  function seek(ev) {
    const points = getDataAtPoint(ev.offsetX);
    setState(points);
    onSeek?.(points);
  }
  function select(ev) {
    const points = getDataAtPoint(ev.offsetX);
    setState(points);
    onSelect?.(points ? points.datum : null);
  }
  function clear() {
    activeData = null;
    onSeek?.(null);
    onSelect?.(null);
  }
  function keyControls(ev) {
    const key = ev.key;
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
});

export { interactorCartesianHorizontal as default };
//# sourceMappingURL=interactor-cartesian-horizontal.js.map
