/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { eq } from 'ember-truth-helpers';
import { htmlSafe } from '@ember/template';

interface ButterflySignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
  };
}

interface ComputedAgeGroup {
  age: string;
  male: number;
  female: number;
  maleWidthStyle: ReturnType<typeof htmlSafe>;
  femaleWidthStyle: ReturnType<typeof htmlSafe>;
}

const maleStyle = htmlSafe('background: #6366f1');
const femaleStyle = htmlSafe('background: #ec4899');

export default class ButterflyChart extends Component<ButterflySignature> {
  @tracked activeAge: string | null = null;

  maxValue = 12;

  @cached
  get data(): ComputedAgeGroup[] {
    const raw = [
      { age: '0-9', male: 6.2, female: 5.8 },
      { age: '10-19', male: 7.1, female: 6.8 },
      { age: '20-29', male: 8.5, female: 8.2 },
      { age: '30-39', male: 9.2, female: 9.0 },
      { age: '40-49', male: 8.8, female: 8.5 },
      { age: '50-59', male: 7.5, female: 7.8 },
      { age: '60-69', male: 5.8, female: 6.2 },
      { age: '70+', male: 4.2, female: 5.5 },
    ];
    return raw.map((d) => ({
      ...d,
      maleWidthStyle: htmlSafe(`width: ${(d.male / this.maxValue) * 100}%`),
      femaleWidthStyle: htmlSafe(`width: ${(d.female / this.maxValue) * 100}%`),
    }));
  }

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Age Distribution"}}</h3>
      </div>
      <div class="chart-card__body">
        <div class="butterfly-chart">
          {{#each this.data as |item|}}
            <div
              class="butterfly-row
                {{if (eq this.activeAge item.age) 'is-active'}}"
              {{on "mouseenter" (fn (mut this.activeAge) item.age)}}
              {{on "mouseleave" (fn (mut this.activeAge) null)}}
            >
              <div class="butterfly-bar butterfly-bar--male">
                <div
                  class="butterfly-fill butterfly-fill--male"
                  style={{item.maleWidthStyle}}
                ></div>
                <span class="butterfly-value">{{item.male}}%</span>
              </div>
              <div class="butterfly-label">{{item.age}}</div>
              <div class="butterfly-bar butterfly-bar--female">
                <div
                  class="butterfly-fill butterfly-fill--female"
                  style={{item.femaleWidthStyle}}
                ></div>
                <span class="butterfly-value">{{item.female}}%</span>
              </div>
            </div>
          {{/each}}
        </div>
        <div class="chart-legend">
          <span class="chart-legend__item">
            <span class="chart-legend__dot" style={{maleStyle}}></span>
            Male
          </span>
          <span class="chart-legend__item">
            <span class="chart-legend__dot" style={{femaleStyle}}></span>
            Female
          </span>
        </div>
      </div>
    </div>
  </template>
}
