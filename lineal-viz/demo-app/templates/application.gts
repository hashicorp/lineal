/**
 * Copyright IBM Corp. 2020, 2026
 */

import { LinkTo } from '@ember/routing';
import { pageTitle } from 'ember-page-title';

<template>
  {{pageTitle "Lineal"}}

  <h2 id="title"> Welcome to Ember </h2>

  <div class="page">
    <nav class="main-nav">
      <div class="sticky">
        <div class="nav-brand">
          <span class="nav-brand__icon">📊</span>
          <span class="nav-brand__text">Lineal</span>
        </div>
        <h3>Navigation</h3>
        <ul>
          <li><LinkTo @route="index">🏠 Home</LinkTo></li>
          <li><LinkTo @route="showcase">✨ Showcase</LinkTo></li>
        </ul>
        <h3>Components</h3>
        <ul>
          <li><LinkTo @route="axes">📏 Axes/Scales</LinkTo></li>
          <li><LinkTo @route="lines">📈 Lines</LinkTo></li>
          <li><LinkTo @route="areas">📊 Areas</LinkTo></li>
          <li><LinkTo @route="arcs">🍩 Arcs</LinkTo></li>
          <li><LinkTo @route="points-bands">⚪ Points/Bands</LinkTo></li>
          <li><LinkTo @route="stacks">📚 Stacks</LinkTo></li>
        </ul>
        <h3>Advanced</h3>
        <ul>
          <li><LinkTo @route="reactivity">⚡ Reactivity</LinkTo></li>
        </ul>
      </div>
    </nav>
    <main>
      {{outlet}}
    </main>
  </div>
</template>
