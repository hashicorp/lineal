/**
 * Copyright IBM Corp. 2020, 2026
 */

import StockChart from '../components/charts/stock-chart';
import DonutChart from '../components/charts/donut-chart';
import BarChart from '../components/charts/bar-chart';
import SparklineChart from '../components/charts/sparkline-chart';
import GaugeChart from '../components/charts/gauge-chart';
import StackedBarChart from '../components/charts/stacked-bar-chart';
import HeatmapChart from '../components/charts/heatmap-chart';
import ScatterPlot from '../components/charts/scatter-plot';
import MultiLineChart from '../components/charts/multi-line-chart';
import HorizontalBarChart from '../components/charts/horizontal-bar-chart';
import RadarChart from '../components/charts/radar-chart';
import LollipopChart from '../components/charts/lollipop-chart';
import BulletChart from '../components/charts/bullet-chart';
import ButterflyChart from '../components/charts/butterfly-chart';
import CandlestickChart from '../components/charts/candlestick-chart';
import StreamGraph from '../components/charts/stream-graph';
import ContributionCalendar from '../components/charts/contribution-calendar';
import DumbbellChart from '../components/charts/dumbbell-chart';
import ProgressRings from '../components/charts/progress-rings';
import SlopeChart from '../components/charts/slope-chart';

<template>
  <div class="showcase">
    <header class="showcase-header">
      <h1>Lineal Visualization Showcase</h1>
      <p>Beautiful, reactive data visualizations built with Ember.js</p>
    </header>

    {{! KPI Sparklines Row }}
    <section class="showcase-section">
      <h2>📊 Key Metrics</h2>
      <p class="showcase-description">
        Compact sparkline cards perfect for dashboards and at-a-glance metrics.
      </p>
      <div class="sparkline-grid">
        <SparklineChart
          @title="Revenue"
          @value="$847K"
          @delta={{12.5}}
          @color="#10b981"
        />
        <SparklineChart
          @title="Users"
          @value="24,521"
          @delta={{8.2}}
          @color="#6366f1"
        />
        <SparklineChart
          @title="Sessions"
          @value="142K"
          @delta={{-3.1}}
          @color="#f59e0b"
        />
        <SparklineChart
          @title="Conversion"
          @value="3.24%"
          @delta={{0.8}}
          @color="#8b5cf6"
        />
      </div>
    </section>

    {{! Stock Chart }}
    <section class="showcase-section">
      <h2>📈 Interactive Time Series</h2>
      <p class="showcase-description">
        Real-time stock price visualization with hover interactions and smooth
        curves.
      </p>
      <StockChart @title="ACME Corp Stock Price" @color="#6366f1" />
    </section>

    {{! Multi-Line Chart }}
    <section class="showcase-section">
      <h2>📉 Multi-Series Comparison</h2>
      <p class="showcase-description">
        Compare multiple metrics over time with synchronized hover states.
      </p>
      <MultiLineChart @title="Growth Metrics (30 Days)" />
    </section>

    {{! Gauge Row }}
    <section class="showcase-section">
      <h2>🎯 Progress Gauges</h2>
      <p class="showcase-description">
        Arc-based gauges with automatic color coding based on progress.
      </p>
      <div class="gauge-grid">
        <GaugeChart @title="CPU Usage" @value={{72}} @max={{100}} @unit="%" />
        <GaugeChart
          @title="Memory"
          @value={{4.2}}
          @max={{8}}
          @unit="GB"
          @color="#6366f1"
        />
        <GaugeChart
          @title="Disk Space"
          @value={{156}}
          @max={{256}}
          @unit="GB"
        />
        <GaugeChart
          @title="Network"
          @value={{89}}
          @max={{100}}
          @unit="%"
          @color="#10b981"
        />
      </div>
    </section>

    {{! Bar Charts Row }}
    <section class="showcase-section showcase-section--split">
      <div class="showcase-split">
        <div class="showcase-split__item">
          <h2>📊 Monthly Trends</h2>
          <p class="showcase-description">
            Vertical bar chart with gradient fills and hover interactions.
          </p>
          <BarChart @title="Revenue by Month" @color="#6366f1" />
        </div>
        <div class="showcase-split__item">
          <h2>🏆 Rankings</h2>
          <p class="showcase-description">
            Horizontal bar chart for comparing categories.
          </p>
          <HorizontalBarChart @title="Programming Languages" />
        </div>
      </div>
    </section>

    {{! Donut & Heatmap Row }}
    <section class="showcase-section showcase-section--split">
      <div class="showcase-split">
        <div class="showcase-split__item">
          <h2>🍩 Distribution</h2>
          <p class="showcase-description">
            Interactive donut chart with hover effects and legend.
          </p>
          <DonutChart @title="Product Mix" />
        </div>
        <div class="showcase-split__item">
          <h2>🗓️ Activity Patterns</h2>
          <p class="showcase-description">
            Heatmap showing activity density across time.
          </p>
          <HeatmapChart @title="Weekly Activity" />
        </div>
      </div>
    </section>

    {{! Stacked Bar Chart }}
    <section class="showcase-section">
      <h2>📚 Stacked Comparison</h2>
      <p class="showcase-description">
        Stacked bar chart showing product distribution across quarters.
      </p>
      <StackedBarChart @title="Quarterly Product Performance" />
    </section>

    {{! Scatter Plot }}
    <section class="showcase-section">
      <h2>⭐ Scatter Analysis</h2>
      <p class="showcase-description">
        Bubble chart with size encoding and category colors.
      </p>
      <ScatterPlot @title="Market Segmentation" />
    </section>

    {{! Radar Chart }}
    <section class="showcase-section">
      <h2>🎯 Radar Comparison</h2>
      <p class="showcase-description">
        Spider/radar chart for comparing multiple attributes across products.
      </p>
      <RadarChart @title="Product Comparison" />
    </section>

    {{! Lollipop & Bullet Charts }}
    <section class="showcase-section showcase-section--split">
      <div class="showcase-split">
        <div class="showcase-split__item">
          <h2>🍭 Lollipop Chart</h2>
          <p class="showcase-description">
            Minimalist alternative to bar charts with dots on sticks.
          </p>
          <LollipopChart @title="Framework Adoption" />
        </div>
        <div class="showcase-split__item">
          <h2>📊 Bullet Chart</h2>
          <p class="showcase-description">
            Progress bars with target markers for KPIs.
          </p>
          <BulletChart @title="KPI Dashboard" />
        </div>
      </div>
    </section>

    {{! Butterfly & Candlestick Charts }}
    <section class="showcase-section showcase-section--split">
      <div class="showcase-split">
        <div class="showcase-split__item">
          <h2>🦋 Population Pyramid</h2>
          <p class="showcase-description">
            Back-to-back horizontal bars for demographic comparisons.
          </p>
          <ButterflyChart @title="Age Distribution" />
        </div>
        <div class="showcase-split__item">
          <h2>📈 Candlestick Chart</h2>
          <p class="showcase-description">
            Financial OHLC data with bullish/bearish coloring.
          </p>
          <CandlestickChart @title="Weekly Trading" />
        </div>
      </div>
    </section>

    {{! Stream Graph }}
    <section class="showcase-section">
      <h2>🌊 Stream Graph</h2>
      <p class="showcase-description">
        Flowing stacked areas showing content trends over time.
      </p>
      <StreamGraph @title="Content Trends" />
    </section>

    {{! Contribution Calendar }}
    <section class="showcase-section">
      <h2>📅 Contribution Calendar</h2>
      <p class="showcase-description">
        GitHub-style activity heatmap showing contributions over a year.
      </p>
      <ContributionCalendar @title="Contribution Activity" />
    </section>

    {{! Dumbbell & Slope Charts }}
    <section class="showcase-section showcase-section--split">
      <div class="showcase-split">
        <div class="showcase-split__item">
          <h2>🎚️ Dumbbell Chart</h2>
          <p class="showcase-description">
            Show ranges or before/after comparisons elegantly.
          </p>
          <DumbbellChart @title="Q1 to Q4 Progress" />
        </div>
        <div class="showcase-split__item">
          <h2>📐 Slope Chart</h2>
          <p class="showcase-description">
            Elegant way to show change between two time points.
          </p>
          <SlopeChart @title="Year over Year" />
        </div>
      </div>
    </section>

    {{! Progress Rings }}
    <section class="showcase-section">
      <h2>⭕ Activity Rings</h2>
      <p class="showcase-description">
        Apple Watch-style concentric progress rings for daily goals.
      </p>
      <ProgressRings @title="Daily Activity" />
    </section>

    <footer class="showcase-footer">
      <p>
        Built with
        <strong>@lineal-viz/lineal</strong>
        — A declarative data visualization library for Ember.js
      </p>
    </footer>
  </div>
</template>
