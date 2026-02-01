/**
 * Copyright IBM Corp. 2020, 2026
 */

import { LinkTo } from '@ember/routing';

<template>
  <div class="welcome">
    <div class="welcome-hero">
      <h1>📊 Lineal</h1>
      <p class="welcome-tagline">
        A declarative, reactive data visualization library for Ember.js
      </p>
      <div class="welcome-actions">
        <LinkTo @route="showcase" class="welcome-btn welcome-btn--primary">
          ✨ View Showcase
        </LinkTo>
      </div>
    </div>

    <div class="welcome-features">
      <div class="welcome-feature">
        <span class="welcome-feature__icon">📈</span>
        <h3>Rich Chart Types</h3>
        <p>Lines, areas, bars, arcs, points, and more.</p>
      </div>
      <div class="welcome-feature">
        <span class="welcome-feature__icon">⚡</span>
        <h3>Reactive by Design</h3>
        <p>Charts update automatically when data changes.</p>
      </div>
      <div class="welcome-feature">
        <span class="welcome-feature__icon">🎨</span>
        <h3>Fully Customizable</h3>
        <p>CSS-based styling and custom color scales.</p>
      </div>
      <div class="welcome-feature">
        <span class="welcome-feature__icon">🖱️</span>
        <h3>Interactive</h3>
        <p>Built-in modifiers for hover states and tooltips.</p>
      </div>
    </div>

    <div class="welcome-nav">
      <h2>Explore Examples</h2>
      <div class="welcome-nav__grid">
        <LinkTo
          @route="showcase"
          class="welcome-nav__item welcome-nav__item--featured"
        >
          <span class="welcome-nav__icon">✨</span>
          <span class="welcome-nav__label">Showcase</span>
          <span class="welcome-nav__desc">Beautiful examples</span>
        </LinkTo>
        <LinkTo @route="lines" class="welcome-nav__item">
          <span class="welcome-nav__icon">📉</span>
          <span class="welcome-nav__label">Lines</span>
          <span class="welcome-nav__desc">Line charts</span>
        </LinkTo>
        <LinkTo @route="areas" class="welcome-nav__item">
          <span class="welcome-nav__icon">📊</span>
          <span class="welcome-nav__label">Areas</span>
          <span class="welcome-nav__desc">Area fills</span>
        </LinkTo>
        <LinkTo @route="arcs" class="welcome-nav__item">
          <span class="welcome-nav__icon">🍩</span>
          <span class="welcome-nav__label">Arcs</span>
          <span class="welcome-nav__desc">Pies and donuts</span>
        </LinkTo>
        <LinkTo @route="stacks" class="welcome-nav__item">
          <span class="welcome-nav__icon">📚</span>
          <span class="welcome-nav__label">Stacks</span>
          <span class="welcome-nav__desc">Stacked charts</span>
        </LinkTo>
        <LinkTo @route="points-bands" class="welcome-nav__item">
          <span class="welcome-nav__icon">⚪</span>
          <span class="welcome-nav__label">Points</span>
          <span class="welcome-nav__desc">Scatter plots</span>
        </LinkTo>
        <LinkTo @route="axes" class="welcome-nav__item">
          <span class="welcome-nav__icon">📏</span>
          <span class="welcome-nav__label">Axes</span>
          <span class="welcome-nav__desc">Scales and axes</span>
        </LinkTo>
        <LinkTo @route="reactivity" class="welcome-nav__item">
          <span class="welcome-nav__icon">⚡</span>
          <span class="welcome-nav__label">Reactivity</span>
          <span class="welcome-nav__desc">Live updates</span>
        </LinkTo>
      </div>
    </div>
  </div>
</template>
