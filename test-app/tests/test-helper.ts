/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import 'qunit-dom';
import Application from 'test-app/app';
import config from 'test-app/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import extendQUnit from './qunit-extensions';

setApplication(Application.create(config.APP));

setup(QUnit.assert);
extendQUnit(QUnit.assert);

start();
