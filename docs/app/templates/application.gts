/**
 * Copyright IBM Corp. 2020, 2026
 */

import { pageTitle } from 'ember-page-title';
import { PageNav } from 'kolay/components';
import { pascalCase, sentenceCase } from 'change-case';

// import './styles.css';

import type { Page } from 'kolay';

function nameFor(x: Page) {
  // We defined componentName via json file

  if ('componentName' in x && typeof x.componentName === 'string') {
    return x.componentName;
  }

  if (x.path.includes('/components/')) {
    return `<${pascalCase(x.name)} />`;
  }

  return sentenceCase(x.name);
}

<template>
  {{pageTitle "DocsApp"}}

  <div class="docs">

    <PageNav>
      <:page as |x|>
        {{! @glint-expect-error }}
        <x.Link>
          {{nameFor x.page}}
        </x.Link>
      </:page>

      <:collection as |x|>
        {{#if x.index}}
          {{! @glint-expect-error }}
          <x.index.Link>
            {{sentenceCase x.collection.name}}
          </x.index.Link>
        {{else}}
          <h3>
            {{sentenceCase x.collection.name}}
          </h3>
        {{/if}}
      </:collection>
    </PageNav>

    <main>
      <article>
        <p class="brand">
          Lineal
          <p>cool branding here</p>
        </p>
        <div>
          {{outlet}}
        </div>
      </article>
    </main>

  </div>
</template>
