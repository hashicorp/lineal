/**
 * Copyright IBM Corp. 2020, 2026
 */

import type Arc from './components/arc.gts';
import type Arcs from './components/arcs.gts';
import type Area from './components/area.gts';
import type Axis from './components/axis.gts';
import type Bars from './components/bars.gts';
import type Fluid from './components/fluid.gts';
import type GridLines from './components/grid-lines.gts';
import type HBars from './components/h-bars.gts';
import type Line from './components/line.gts';
import type Points from './components/points.gts';
import type VBars from './components/v-bars.gts';

import type cssRange from './helpers/css-range.ts';
import type scaleBand from './helpers/scale-band.ts';
import type scaleDivergingLog from './helpers/scale-diverging-log.ts';
import type scaleDivergingPow from './helpers/scale-diverging-pow.ts';
import type scaleDivergingSqrt from './helpers/scale-diverging-sqrt.ts';
import type scaleDivergingSymlog from './helpers/scale-diverging-symlog.ts';
import type scaleDiverging from './helpers/scale-diverging.ts';
import type scaleFnCompute from './helpers/scale-fn-compute.ts';
import type scaleFnDerive from './helpers/scale-fn-derive.ts';
import type scaleIdentity from './helpers/scale-identity.ts';
import type scaleLinear from './helpers/scale-linear.ts';
import type scaleLog from './helpers/scale-log.ts';
import type scaleOrdinal from './helpers/scale-ordinal.ts';
import type scalePoint from './helpers/scale-point.ts';
import type scalePow from './helpers/scale-pow.ts';
import type scaleQuantile from './helpers/scale-quantile.ts';
import type scaleQuantize from './helpers/scale-quantize.ts';
import type scaleRadial from './helpers/scale-radial.ts';
import type scaleSqrt from './helpers/scale-sqrt.ts';
import type scaleSymlog from './helpers/scale-symlog.ts';
import type scaleThreshold from './helpers/scale-threshold.ts';
import type scaleTime from './helpers/scale-time.ts';
import type scaleUtc from './helpers/scale-utc.ts';
import type stack from './helpers/stack.ts';
import type stackH from './helpers/stack-h.ts';
import type stackV from './helpers/stack-v.ts';

import type interactorCartesianHorizontal from './modifiers/interactor-cartesian-horizontal.ts';

export default interface LinealRegistry {
  // Components
  Arc: typeof Arc;
  Arcs: typeof Arcs;
  Area: typeof Area;
  Axis: typeof Axis;
  Bars: typeof Bars;
  Fluid: typeof Fluid;
  GridLines: typeof GridLines;
  HBars: typeof HBars;
  Line: typeof Line;
  Points: typeof Points;
  VBars: typeof VBars;

  // Helpers
  'css-range': typeof cssRange;
  'scale-band': typeof scaleBand;
  'scale-diverging-log': typeof scaleDivergingLog;
  'scale-diverging-pow': typeof scaleDivergingPow;
  'scale-diverging-sqrt': typeof scaleDivergingSqrt;
  'scale-diverging-symlog': typeof scaleDivergingSymlog;
  'scale-diverging': typeof scaleDiverging;
  'scale-fn-compute': typeof scaleFnCompute;
  'scale-fn-derive': typeof scaleFnDerive;
  'scale-identity': typeof scaleIdentity;
  'scale-linear': typeof scaleLinear;
  'scale-log': typeof scaleLog;
  'scale-ordinal': typeof scaleOrdinal;
  'scale-point': typeof scalePoint;
  'scale-pow': typeof scalePow;
  'scale-quantile': typeof scaleQuantile;
  'scale-quantize': typeof scaleQuantize;
  'scale-radial': typeof scaleRadial;
  'scale-sqrt': typeof scaleSqrt;
  'scale-symlog': typeof scaleSymlog;
  'scale-threshold': typeof scaleThreshold;
  'scale-time': typeof scaleTime;
  'scale-utc': typeof scaleUtc;
  stack: typeof stack;
  'stack-h': typeof stackH;
  'stack-v': typeof stackV;

  // Modifiers
  'interactor-cartesian-horizontal': typeof interactorCartesianHorizontal;
}
