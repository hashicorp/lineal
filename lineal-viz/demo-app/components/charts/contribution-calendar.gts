/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { htmlSafe } from '@ember/template';

interface ContributionCalendarSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
  };
}

interface DayData {
  date: string;
  count: number;
  x: number;
  y: number;
  fillStyle: ReturnType<typeof htmlSafe>;
}

// Style handled by fillStyle
const legendNone = htmlSafe('background: #ebedf0');
const legendLow = htmlSafe('background: #9be9a8');
const legendMed = htmlSafe('background: #40c463');
const legendHigh = htmlSafe('background: #30a14e');
const legendMax = htmlSafe('background: #216e39');

function getColor(count: number): string {
  if (count === 0) return '#ebedf0';
  if (count <= 3) return '#9be9a8';
  if (count <= 6) return '#40c463';
  if (count <= 9) return '#30a14e';
  return '#216e39';
}

export default class ContributionCalendar extends Component<ContributionCalendarSignature> {
  @tracked activeDay: DayData | null = null;

  @cached
  get data(): DayData[] {
    const days: DayData[] = [];
    const startDate = new Date('2024-01-01');
    const weeks = 52;

    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + week * 7 + day);

        // Generate random contribution count with some patterns
        const isWeekend = day === 0 || day === 6;
        const baseChance = isWeekend ? 0.3 : 0.7;
        const hasContribution = Math.random() < baseChance;
        const count = hasContribution ? Math.floor(Math.random() * 12) : 0;

        days.push({
          date: date.toISOString().split('T')[0] ?? '',
          count,
          x: week * 14,
          y: day * 14,
          fillStyle: htmlSafe(`fill: ${getColor(count)}`),
        });
      }
    }
    return days;
  }

  get totalContributions(): number {
    return this.data.reduce((sum, d) => sum + d.count, 0);
  }

  get months(): Array<{ name: string; x: number }> {
    return [
      { name: 'Jan', x: 0 },
      { name: 'Feb', x: 60 },
      { name: 'Mar', x: 116 },
      { name: 'Apr', x: 172 },
      { name: 'May', x: 228 },
      { name: 'Jun', x: 284 },
      { name: 'Jul', x: 340 },
      { name: 'Aug', x: 396 },
      { name: 'Sep', x: 452 },
      { name: 'Oct', x: 508 },
      { name: 'Nov', x: 564 },
      { name: 'Dec', x: 620 },
    ];
  }

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Contribution Activity"}}</h3>
        <div class="chart-card__value">
          <span class="chart-card__label">Total</span>
          <span class="chart-card__amount">{{this.totalContributions}}</span>
        </div>
      </div>
      <div class="chart-card__body">
        <div class="contribution-calendar-wrapper">
          <svg
            viewBox="0 0 740 120"
            class="contribution-calendar-svg"
            preserveAspectRatio="xMidYMid meet"
          >
            {{! Month labels }}
            {{#each this.months as |month|}}
              <text
                x={{month.x}}
                y="10"
                class="contribution-month-label"
              >{{month.name}}</text>
            {{/each}}

            <g transform="translate(0, 18)">
              {{! Day labels }}
              <text
                x="-10"
                y="26"
                text-anchor="end"
                class="contribution-day-label"
              >Mon</text>
              <text
                x="-10"
                y="54"
                text-anchor="end"
                class="contribution-day-label"
              >Wed</text>
              <text
                x="-10"
                y="82"
                text-anchor="end"
                class="contribution-day-label"
              >Fri</text>

              {{! Contribution squares }}
              {{#each this.data as |day|}}
                <rect
                  x={{day.x}}
                  y={{day.y}}
                  width="11"
                  height="11"
                  rx="2"
                  style={{day.fillStyle}}
                  class="contribution-day {{if this.activeDay 'has-tooltip'}}"
                  {{on "mouseenter" (fn (mut this.activeDay) day)}}
                  {{on "mouseleave" (fn (mut this.activeDay) null)}}
                />
              {{/each}}
            </g>
          </svg>

          {{#if this.activeDay}}
            <div class="contribution-tooltip">
              {{this.activeDay.count}}
              contributions on
              {{this.activeDay.date}}
            </div>
          {{/if}}
        </div>

        <div class="contribution-legend">
          <span class="contribution-legend-text">Less</span>
          <span class="contribution-legend-box" style={{legendNone}}></span>
          <span class="contribution-legend-box" style={{legendLow}}></span>
          <span class="contribution-legend-box" style={{legendMed}}></span>
          <span class="contribution-legend-box" style={{legendHigh}}></span>
          <span class="contribution-legend-box" style={{legendMax}}></span>
          <span class="contribution-legend-text">More</span>
        </div>
      </div>
    </div>
  </template>
}
