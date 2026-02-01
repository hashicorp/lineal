/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';

interface BulletSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
  };
}

interface ComputedBulletItem {
  label: string;
  value: number;
  target: number;
  max: number;
  valueStyle: ReturnType<typeof htmlSafe>;
  targetStyle: ReturnType<typeof htmlSafe>;
}

const currentDotStyle = htmlSafe('background: #1e293b');
const targetDotStyle = htmlSafe('background: #ef4444');
const lightBgStyle = htmlSafe('width: 100%');
const medBgStyle = htmlSafe('width: 50%');
const darkBgStyle = htmlSafe('width: 25%');

export default class BulletChart extends Component<BulletSignature> {
  @cached
  get data(): ComputedBulletItem[] {
    const raw = [
      { label: 'Revenue', value: 275, target: 250, max: 300 },
      { label: 'Profit', value: 85, target: 100, max: 120 },
      { label: 'Customers', value: 1850, target: 2000, max: 2500 },
      { label: 'Satisfaction', value: 4.2, target: 4.5, max: 5 },
    ];
    return raw.map((d) => {
      const valuePercent = Math.min((d.value / d.max) * 100, 100);
      const targetPercent = Math.min((d.target / d.max) * 100, 100);
      return {
        ...d,
        valueStyle: htmlSafe(`width: ${valuePercent}%`),
        targetStyle: htmlSafe(`left: ${targetPercent}%`),
      };
    });
  }

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "KPI Dashboard"}}</h3>
      </div>
      <div class="chart-card__body">
        <div class="bullet-chart-grid">
          {{#each this.data as |item|}}
            <div class="bullet-chart-row">
              <span class="bullet-chart-label">{{item.label}}</span>
              <div class="bullet-chart-bar">
                <div
                  class="bullet-bg bullet-bg--light"
                  style={{lightBgStyle}}
                ></div>
                <div
                  class="bullet-bg bullet-bg--medium"
                  style={{medBgStyle}}
                ></div>
                <div
                  class="bullet-bg bullet-bg--dark"
                  style={{darkBgStyle}}
                ></div>
                <div class="bullet-value" style={{item.valueStyle}}></div>
                <div class="bullet-target" style={{item.targetStyle}}></div>
              </div>
            </div>
          {{/each}}
        </div>
        <div class="chart-legend">
          <span class="chart-legend__item">
            <span class="chart-legend__dot" style={{currentDotStyle}}></span>
            Current
          </span>
          <span class="chart-legend__item">
            <span class="chart-legend__dot" style={{targetDotStyle}}></span>
            Target
          </span>
        </div>
      </div>
    </div>
  </template>
}
