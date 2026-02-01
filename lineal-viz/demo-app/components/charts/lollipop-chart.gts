import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { htmlSafe } from '@ember/template';

interface RawItem {
  category: string;
  value: number;
  color: string;
}

interface ComputedItem extends RawItem {
  yPos: number;
  barWidth: number;
}

interface LollipopChartSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
  };
}

// Raw data
const rawData: RawItem[] = [
  { category: 'JavaScript', value: 92, color: '#f7df1e' },
  { category: 'Python', value: 85, color: '#3776ab' },
  { category: 'TypeScript', value: 78, color: '#3178c6' },
  { category: 'Go', value: 65, color: '#00add8' },
  { category: 'Rust', value: 52, color: '#ce422b' },
  { category: 'Java', value: 48, color: '#007396' },
];

export default class LollipopChart extends Component<LollipopChartSignature> {
  // Chart dimensions
  chartWidth = 520;
  chartHeight = 260;
  leftMargin = 100;
  rightMargin = 40;
  topMargin = 20;
  bottomMargin = 30;
  rowHeight = 35;

  @cached
  get data(): ComputedItem[] {
    const barAreaWidth = this.chartWidth - this.leftMargin - this.rightMargin;
    const startY = this.topMargin;

    return rawData.map((d, i) => ({
      ...d,
      yPos: startY + i * this.rowHeight + this.rowHeight / 2,
      barWidth: this.leftMargin + (d.value / 100) * barAreaWidth,
    }));
  }

  @cached
  get xTicks(): Array<{ value: number; x: number }> {
    const barAreaWidth = this.chartWidth - this.leftMargin - this.rightMargin;
    return [0, 25, 50, 75, 100].map((v) => ({
      value: v,
      x: this.leftMargin + (v / 100) * barAreaWidth,
    }));
  }

  get viewBox(): string {
    return `0 0 ${this.chartWidth} ${this.chartHeight}`;
  }

  getLineStyle = (item: ComputedItem) => {
    return htmlSafe(`stroke: ${item.color}; stroke-width: 3;`);
  };

  getCircleStyle = (item: ComputedItem) => {
    return htmlSafe(`fill: ${item.color};`);
  };

  cardStyle = htmlSafe('max-width: 520px;');

  <template>
    <div class="chart-card lollipop-chart" style={{this.cardStyle}}>
      <div class="chart-card__header">
        <h3>Programming Language Popularity</h3>
      </div>
      <div class="chart-card__body">
        <svg viewBox={{this.viewBox}} class="chart-svg">
          {{! Grid lines }}
          {{#each this.xTicks as |tick|}}
            <line
              x1={{tick.x}}
              y1={{this.topMargin}}
              x2={{tick.x}}
              y2={{this.chartHeight}}
              stroke="#e5e7eb"
              stroke-width="1"
              stroke-dasharray="4,4"
            />
            <text
              x={{tick.x}}
              y={{this.chartHeight}}
              text-anchor="middle"
              class="chart-axis-label"
            >
              {{tick.value}}%
            </text>
          {{/each}}

          {{! Y-axis labels }}
          {{#each this.data as |item|}}
            <text
              x={{this.leftMargin}}
              y={{item.yPos}}
              dx="-10"
              text-anchor="end"
              dominant-baseline="middle"
              class="chart-axis-label"
            >
              {{item.category}}
            </text>
          {{/each}}

          {{! Lollipop lines }}
          {{#each this.data as |item|}}
            <line
              x1={{this.leftMargin}}
              y1={{item.yPos}}
              x2={{item.barWidth}}
              y2={{item.yPos}}
              style={{this.getLineStyle item}}
            />
          {{/each}}

          {{! Lollipop circles }}
          {{#each this.data as |item|}}
            <circle
              cx={{item.barWidth}}
              cy={{item.yPos}}
              r="8"
              style={{this.getCircleStyle item}}
            />
            <text
              x={{item.barWidth}}
              y={{item.yPos}}
              dx="16"
              dominant-baseline="middle"
              class="chart-axis-label"
              font-weight="600"
            >
              {{item.value}}%
            </text>
          {{/each}}
        </svg>
      </div>
    </div>
  </template>
}
