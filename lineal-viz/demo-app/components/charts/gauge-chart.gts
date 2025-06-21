/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';

import Arc from '@lineal-viz/lineal/components/arc';

interface GaugeChartSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
    value?: number;
    max?: number;
    color?: string;
    unit?: string;
  };
}

export default class GaugeChart extends Component<GaugeChartSignature> {
  get value() {
    return this.args.value ?? 75;
  }

  get max() {
    return this.args.max ?? 100;
  }

  get percentage() {
    return Math.min(100, Math.max(0, (this.value / this.max) * 100));
  }

  get color() {
    if (this.args.color) return this.args.color;
    // Auto-color based on value
    if (this.percentage >= 80) return '#10b981'; // Green
    if (this.percentage >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  }

  get startAngle() {
    return -135 * (Math.PI / 180);
  }

  get endAngle() {
    return 135 * (Math.PI / 180);
  }

  get valueAngle() {
    const range = this.endAngle - this.startAngle;
    return this.startAngle + (this.percentage / 100) * range;
  }

  <template>
    <div class="gauge-card" ...attributes>
      <div class="gauge-card__chart">
        <svg width="180" height="120" viewBox="0 0 180 120" class="chart-svg">
          <g transform="translate(90 100)">
            {{! Background arc }}
            <Arc
              @startAngle={{this.startAngle}}
              @endAngle={{this.endAngle}}
              @innerRadius={{60}}
              @outerRadius={{75}}
              fill="#e2e8f0"
            />
            {{! Value arc }}
            <Arc
              @startAngle={{this.startAngle}}
              @endAngle={{this.valueAngle}}
              @innerRadius={{60}}
              @outerRadius={{75}}
              @cornerRadius={{4}}
              fill={{this.color}}
            />
            {{! Center text }}
            <text
              y="-20"
              text-anchor="middle"
              class="gauge-value"
              fill={{this.color}}
            >{{this.value}}{{if @unit @unit ""}}</text>
            <text y="0" text-anchor="middle" class="gauge-label">of
              {{this.max}}</text>
          </g>
        </svg>
      </div>
      <div class="gauge-card__title">{{if @title @title "Progress"}}</div>
    </div>
  </template>
}
