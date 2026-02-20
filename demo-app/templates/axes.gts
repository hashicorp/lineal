/**
 * Copyright IBM Corp. 2020, 2026
 */

import { array } from '@ember/helper';
import scalePow from '@lineal-viz/lineal/helpers/scale-pow';
import Axis, { Orientation } from '@lineal-viz/lineal/components/axis';
import scaleLinear from '@lineal-viz/lineal/helpers/scale-linear';
import scaleFnCompute from '@lineal-viz/lineal/helpers/scale-fn-compute';
import scaleLog from '@lineal-viz/lineal/helpers/scale-log';
import scaleSqrt from '@lineal-viz/lineal/helpers/scale-sqrt';
import scaleSymlog from '@lineal-viz/lineal/helpers/scale-symlog';
import scaleOrdinal from '@lineal-viz/lineal/helpers/scale-ordinal';
import cssRange from '@lineal-viz/lineal/helpers/css-range';

<template>
  <h2>Axes </h2>

  {{#let (scalePow range="15..785" domain="0..10" exponent=2) as |scale|}}
    <svg class="no-overflow" width="800" height="30">
      <Axis @scale={{scale}} @orientation={{Orientation.Bottom}} />
    </svg>
    <svg class="no-overflow" width="800" height="30">
      <Axis @scale={{scale}} @orientation={{Orientation.Top}} as |tick|>
        <text
          fill="red"
          y={{tick.offset}}
          text-anchor={{tick.textAnchor}}
        >{{tick.label}}</text>
        <text x="15" y={{-20}} transform="rotate(-45)">Fish!</text>
        <circle r="3"></circle>
      </Axis>
    </svg>
    <svg class="no-overflow" width="100" height="300">
      <Axis @scale={{scale}} @orientation={{Orientation.Left}} />
    </svg>
    <svg class="no-overflow" width="100" height="300">
      <Axis @scale={{scale}} @orientation={{Orientation.Right}} />
    </svg>
  {{/let}}

  <h2>Scale Linear </h2>

  <svg width="800" height="6">
    {{#let (scaleLinear range="15..785" domain="0..10") as |scale|}}
      {{#each (array 0 1 2 3 4 5 6 7 8 9 10) as |v|}}
        <circle cx={{scaleFnCompute scale v}} cy="3" r="3"></circle>
      {{/each}}
    {{/let}}
  </svg>

  <h2> Scale Pow(^ 2) </h2>

  <svg class="scale-pow" width="800" height="6">
    {{#let (scalePow range="15..785" domain="0..10" exponent=2) as |scale|}}
      {{#each (array 0 1 2 3 4 5 6 7 8 9 10) as |v|}}
        <circle cx={{scale.compute v}} cy="3" r="3"></circle>
      {{/each}}
    {{/let}}
  </svg>

  <h2> Scale Log </h2>

  <svg class="scale-log" width="800" height="6">
    {{#let (scaleLog range="15..785" domain="1..10") as |scale|}}
      {{#each (array 1 2 3 4 5 6 7 8 9 10) as |v|}}
        <circle cx={{scale.compute v}} cy="3" r="3"></circle>
      {{/each}}
    {{/let}}
  </svg>

  <h2> Scale Sqrt </h2>

  <svg class="scale-sqrt" width="800" height="6">
    {{#let (scaleSqrt range="15..785" domain="0..10") as |scale|}}
      {{#each (array 0 1 2 3 4 5 6 7 8 9 10) as |v|}}
        <circle cx={{scale.compute v}} cy="3" r="3"></circle>
      {{/each}}
    {{/let}}
  </svg>

  <h2> Scale Symlog </h2>

  <svg class="scale-symlog" width="800" height="6">
    {{#let (scaleSymlog range="15..785" domain="0..10") as |scale|}}
      {{#each (array 0 1 2 3 4 5 6 7 8 9 10) as |v|}}
        <circle cx={{scale.compute v}} cy="3" r="3"></circle>
      {{/each}}
    {{/let}}
  </svg>

  <h2>Scale Ordinal</h2>

  <svg class="scale-symlog" width="800" height="10">
    {{#let
      (scaleOrdinal range=(cssRange "reds") domain=(array "A" "B" "C"))
      (scaleLinear range="15..785" domain="0..9")
      as |colorScale xScale|
    }}
      {{#each (array "A" "A" "B" "C" "B" "B" "A" "B" "C" "A") as |v idx|}}
        <circle
          class={{colorScale.compute v}}
          cx={{xScale.compute idx}}
          cy="5"
          r="5"
        ></circle>
      {{/each}}
    {{/let}}
  </svg>
</template>
