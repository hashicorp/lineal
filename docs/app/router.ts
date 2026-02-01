/**
 * Copyright IBM Corp. 2020, 2026
 */

import EmberRouter from '@embroider/router';
import config from 'docs/config/environment';
import { addRoutes } from 'kolay';
import { properLinks } from 'ember-primitives/proper-links';

@properLinks
export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  addRoutes(this);
});
