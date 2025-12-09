/**
 * Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { tracked, cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import Stack from '@lineal-viz/lineal/transforms/stack';
import { energyMix } from '../utils/data/energy-mix';

const rand = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

let d = 6;

export default class StacksController extends Controller {
  @tracked activePop = null;
  @tracked activeStackSlice = null;

  @tracked stacked = new Stack({
    data: this.newData,
    order: 'ascending',
    x: 'hour',
    y: 'value',
    z: 'day',
  });

  daysOfWeek = 'Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.split(
    ' '
  );

  energyMix = Object.freeze(energyMix);

  @cached get g20() {
    return Array.from(new Set(this.energyMix.map((d) => d.region)));
  }

  @cached get g20ByConsumption() {
    const agg = this.energyMix.reduce(
      (hash: { [key: string]: any }, record) => {
        const region = hash[record.region] ?? {
          region: record.region,
          sum: 0,
        };
        region.sum += record.value;
        hash[record.region] = region;
        return hash;
      },
      {}
    );
    return this.g20.sort((a, b) => agg[b].sum - agg[a].sum);
  }

  @cached get divergingEnergyMix() {
    return this.energyMix.map((d) => {
      const value = ['Coal', 'Oil', 'Gas'].includes(d.source)
        ? -d.value
        : d.value;
      return { ...d, value };
    });
  }

  get frequencyByDay() {
    return [
      { day: 'Monday', hour: 9, value: rand(1, 20) },
      { day: 'Monday', hour: 10, value: rand(1, 20) },
      { day: 'Monday', hour: 11, value: rand(1, 20) },
      { day: 'Monday', hour: 12, value: rand(1, 20) },

      { day: 'Tuesday', hour: 11, value: rand(1, 20) },
      { day: 'Tuesday', hour: 12, value: rand(1, 20) },
      { day: 'Tuesday', hour: 14, value: rand(1, 20) },
      { day: 'Tuesday', hour: 18, value: rand(1, 20) },

      { day: 'Wednesday', hour: 11, value: rand(1, 20) },
      { day: 'Wednesday', hour: 12, value: rand(1, 20) },

      { day: 'Thursday', hour: 11, value: rand(1, 20) },
      { day: 'Thursday', hour: 12, value: rand(1, 20) },
      { day: 'Thursday', hour: 14, value: rand(1, 20) },
      { day: 'Thursday', hour: 15, value: rand(1, 20) },
      { day: 'Thursday', hour: 18, value: rand(1, 20) },

      { day: 'Friday', hour: 17, value: rand(1, 20) },

      { day: 'Sunday', hour: 0, value: rand(1, 20) },
      { day: 'Sunday', hour: 1, value: rand(1, 20) },
      { day: 'Sunday', hour: 2, value: rand(1, 20) },
      { day: 'Sunday', hour: 3, value: rand(1, 20) },
      { day: 'Sunday', hour: 4, value: rand(1, 20) },
    ];
  }

  @cached get paddedFrequencyByDay() {
    const freq = this.frequencyByDay;
    const data = [];
    for (const day of this.daysOfWeek) {
      for (let hour = 0; hour < 24; hour++) {
        data.push(
          freq.find((d) => d.day === day && d.hour === hour) || {
            day,
            hour,
            value: 2,
          }
        );
      }
    }
    return data;
  }

  @cached get newData() {
    return [
      { day: 'Sunday', hour: 0, value: 1 },
      { day: 'Sunday', hour: 1, value: 2 },
      { day: 'Sunday', hour: 2, value: 1 },
      { day: 'Sunday', hour: 3, value: 2 },
      { day: 'Sunday', hour: 4, value: 1 },
      { day: 'Sunday', hour: 5, value: 2 },

      { day: 'Monday', hour: 0, value: 1 },
      { day: 'Monday', hour: 1, value: 2 },
      { day: 'Monday', hour: 2, value: 3 },
      { day: 'Monday', hour: 3, value: 4 },
      { day: 'Monday', hour: 4, value: 5 },
      { day: 'Monday', hour: 5, value: 6 },

      { day: 'Tuesday', hour: 0, value: 5 },
      { day: 'Tuesday', hour: 1, value: 0 },
      { day: 'Tuesday', hour: 2, value: 5 },
      { day: 'Tuesday', hour: 3, value: 0 },
      { day: 'Tuesday', hour: 4, value: 10 },
      { day: 'Tuesday', hour: 5, value: 0 },
    ];
  }

  @action
  appendTestData() {
    const hour = ++d;
    this.stacked.dataIn = [
      ...this.stacked.dataIn,
      ...['Sunday', 'Monday', 'Tuesday'].map((day) => ({
        day,
        hour,
        value: Math.random() * 5 + 1,
      })),
    ];
  }

  @action
  updateActiveDataPop(activeData: any) {
    this.activePop = activeData;
  }

  @action
  updateActiveStackDatum(activeData: any) {
    this.activeStackSlice = activeData;
  }
}
