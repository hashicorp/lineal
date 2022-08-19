'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  return {
    useYarn: true,
    scenarios: [
      // It might be nice to add these scenarios back some day, but right now they just spin in CI
      //
      // {
      //   name: 'ember-lts-3.24',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': '~3.24.3',
      //     },
      //   },
      // },
      // {
      //   name: 'ember-lts-3.28',
      //   npm: {
      //     devDependencies: {
      //       'ember-source': '~3.28.0',
      //     },
      //   },
      // },
      // {
      //   name: 'ember-classic',
      //   env: {
      //     EMBER_OPTIONAL_FEATURES: JSON.stringify({
      //       'application-template-wrapper': true,
      //       'default-async-observers': false,
      //       'template-only-glimmer-components': false,
      //     }),
      //   },
      //   npm: {
      //     devDependencies: {
      //       'ember-source': '~3.28.0',
      //     },
      //     ember: {
      //       edition: 'classic',
      //     },
      //   },
      // },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
      embroiderSafe(),
      embroiderOptimized(),
    ],
  };
};
