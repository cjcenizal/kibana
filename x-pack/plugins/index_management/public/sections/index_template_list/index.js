/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component, Fragment } from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage, injectI18n } from '@kbn/i18n/react';
import { Route } from 'react-router-dom';

export class IndexTemplateList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedIndicesMap: {},
    };
  }

  render() {
    return (
      <div>
        Hi
      </div>
    );
  }
}
