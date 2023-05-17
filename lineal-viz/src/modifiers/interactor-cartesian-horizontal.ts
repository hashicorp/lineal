/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { modifier } from 'ember-modifier';
import { Scale } from '../scale';
import { Accessor, Encoding } from '../encoding';
import { bisector } from 'd3-array';

/**
 * The available arguments to the `interactor-cartesian-horizontal` modifier.
 */
export interface InteractorArgs {
  /** A dataset of any type of data. */
  data: any[];
  /** The scale the represents the x-axis of the plot being interacted with. */
  xScale: Scale;
  /** The accessor for the x encoding of the plot being interacted with. */
  x: Accessor;
  /** The accessor (or accessors) for looking up data encoded on the y-axis. */
  y: Accessor | Accessor[];
  /** How sensitive rounding is when determining if near data should be included in
   * a selection. Measured in pixel space (i.e., after values have been computed by scales). */
  distanceThreshold: number;
  /** Called when the the modified element receives mouse movement or left/right arrow key input. */
  onSeek?: (data: ActiveData | null) => void;
  /** Called when the the modified element receives mouse click or space/enter key input. */
  onSelect?: (datum: ActiveDatum | null) => void;
}

export interface ActiveDatum {
  /** The encoding that corresponds to the `datum`. Useful for determining which
   * series the `datum` belongs to. */
  encoding: Encoding;
  /** An element from the data array provided to the Modifier. */
  datum: any;
}

export interface ActiveData {
  /** The element from the data array provided to the Modifier that is
   * closest to the interaction point. */
  datum: ActiveDatum;
  /** Surrounding data from the data array provided to the Modifier that is close
   * to the interaction point (as determined by the `distanceThreshold`). */
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
    _,
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

        // Collect all data with the same x value as the active datum (generally means a
        // multi-series dataset).
        const matchVal = xEnc.accessor(datum);
        const relatedData = subjectData.filter((d) => xEnc.accessor(d) === matchVal);

        agg.push(...relatedData.map((datum) => ({ encoding, datum })));
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
