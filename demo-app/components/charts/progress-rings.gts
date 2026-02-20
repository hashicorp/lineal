/**
 * Copyright IBM Corp. 2020, 2026
 */

import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { eq } from 'ember-truth-helpers';
import { htmlSafe } from '@ember/template';

import Arc from '@lineal-viz/lineal/components/arc';

interface RingData {
  label: string;
  value: number;
  goal: number;
  color: string;
}

interface ComputedRing extends RingData {
  outerRadius: number;
  innerRadius: number;
  endAngle: number;
  progress: number;
  gradientId: string;
  dotStyle: ReturnType<typeof htmlSafe>;
}

interface ProgressRingsSignature {
  Element: HTMLDivElement;
  Args: {
    title?: string;
  };
}

const arcStyle = htmlSafe('cursor: pointer; transition: all 0.2s ease;');

export default class ProgressRings extends Component<ProgressRingsSignature> {
  @tracked activeRing: RingData | null = null;

  @cached
  get rawData(): RingData[] {
    return [
      { label: 'Move', value: 420, goal: 500, color: '#ef4444' },
      { label: 'Exercise', value: 28, goal: 30, color: '#22c55e' },
      { label: 'Stand', value: 10, goal: 12, color: '#3b82f6' },
    ];
  }

  @cached
  get rings(): ComputedRing[] {
    return this.rawData.map((d, index) => {
      const progress = Math.min(d.value / d.goal, 1);
      return {
        ...d,
        outerRadius: 100 - index * 28,
        innerRadius: 85 - index * 28,
        endAngle: progress * Math.PI * 2,
        progress,
        gradientId: `ring-gradient-${index}`,
        dotStyle: htmlSafe(`background: ${d.color}`),
      };
    });
  }

  get defaultProgress(): number {
    const first = this.rawData[0];
    if (!first) return 0;
    return Math.round((first.value / first.goal) * 100);
  }

  <template>
    <div class="chart-card" ...attributes>
      <div class="chart-card__header">
        <h3>{{if @title @title "Daily Activity"}}</h3>
      </div>
      <div class="chart-card__body" style="text-align: center;">
        <svg
          width="240"
          height="240"
          viewBox="-120 -120 240 240"
          class="chart-svg"
        >
          <defs>
            {{#each this.rings as |ring|}}
              <linearGradient
                id={{ring.gradientId}}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stop-color={{ring.color}} stop-opacity="1" />
                <stop
                  offset="100%"
                  stop-color={{ring.color}}
                  stop-opacity="0.7"
                />
              </linearGradient>
            {{/each}}
            <filter id="ring-glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {{#each this.rings as |ring|}}
            {{! Background ring }}
            <Arc
              @startAngle={{0}}
              @endAngle={{6.28318}}
              @outerRadius={{ring.outerRadius}}
              @innerRadius={{ring.innerRadius}}
              fill={{ring.color}}
              opacity="0.15"
            />

            {{! Progress ring }}
            <Arc
              @startAngle={{0}}
              @endAngle={{ring.endAngle}}
              @outerRadius={{ring.outerRadius}}
              @innerRadius={{ring.innerRadius}}
              @cornerRadius={{8}}
              fill={{ring.color}}
              style={{arcStyle}}
              {{on "mouseenter" (fn (mut this.activeRing) ring)}}
              {{on "mouseleave" (fn (mut this.activeRing) null)}}
            />
          {{/each}}

          {{! Center text }}
          <text x="0" y="-8" text-anchor="middle" class="progress-rings-value">
            {{#if this.activeRing}}
              {{this.activeRing.value}}/{{this.activeRing.goal}}
            {{else}}
              {{this.defaultProgress}}%
            {{/if}}
          </text>
          <text x="0" y="14" text-anchor="middle" class="progress-rings-label">
            {{#if this.activeRing}}
              {{this.activeRing.label}}
            {{else}}
              Move
            {{/if}}
          </text>
        </svg>

        <div class="progress-rings-legend">
          {{#each this.rings as |ring|}}
            <button
              type="button"
              class="progress-ring-item
                {{if (eq this.activeRing ring) 'is-active'}}"
              {{on "mouseenter" (fn (mut this.activeRing) ring)}}
              {{on "mouseleave" (fn (mut this.activeRing) null)}}
            >
              <span class="progress-ring-dot" style={{ring.dotStyle}}></span>
              <span class="progress-ring-info">
                <span class="progress-ring-label">{{ring.label}}</span>
                <span class="progress-ring-stat">{{ring.value}}
                  /
                  {{ring.goal}}</span>
              </span>
            </button>
          {{/each}}
        </div>
      </div>
    </div>
  </template>
}
