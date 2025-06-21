/**
 * Copyright IBM Corp. 2020, 2026
 */

import { Page } from 'kolay/components';

// Removes the App Shell / welcome UI
// before initial rendering and chunk loading finishes
function removeLoader() {
  document.querySelector('#kolay__loading')?.remove();
}

<template>
  <Page>
    <:pending>
      <div class="loading-page">
        Loading, compiling, etc
      </div>
    </:pending>

    <:error as |error|>
      <div>
        {{error}}
      </div>
      {{(removeLoader)}}
    </:error>

    <:success as |Prose|>
      {{! @glint-expect-error }}
      <Prose />
      {{(removeLoader)}}
    </:success>

  </Page>
</template>
