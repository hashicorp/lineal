/**
 * Copyright IBM Corp. 2022, 2023
 * SPDX-License-Identifier: MPL-2.0
 */

import EmberRouter from '@ember/routing/router';
import config from 'test-app/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('axes');
  this.route('lines');
  this.route('areas');
  this.route('arcs');
  this.route('points-bands');
  this.route('reactivity');
  this.route('stacks');
});
