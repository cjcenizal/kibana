/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment, useEffect, useState } from 'react';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';

import {
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiTitle,
  EuiText,
} from '@elastic/eui';

import { BASE_PATH, UIM_APP_LOAD } from '../common/constants';
import { IndexList } from './sections/index_list';
import { IndexTemplateList } from './sections/index_template_list';
import { ReindexingList } from './sections/reindexing_list';
import { trackUiMetric } from './services';

export const App = () => {
  useEffect(() => trackUiMetric(UIM_APP_LOAD), []);

  return (
    <HashRouter>
      <AppWithoutRouter />
    </HashRouter>
  );
};

// Exoprt this so we can test it with a different router.
export const AppWithoutRouter = () => {
  const [selectedTab, selectTab] = useState('indices');

  const tabs = [
    {
      id: 'indices',
      name: 'Indices',
    },
    {
      id: 'index_templates',
      name: 'Index templates',
    },
    {
      id: 'reindexing_list',
      name: 'Reindex tasks',
    },
  ];

  return (
    <EuiPageContent>
      <EuiTitle size="m">
        <h1>
          Index Management
        </h1>
      </EuiTitle>

      <EuiSpacer size="s" />

      <EuiTabs>
        {tabs.map(tab => (
          <EuiTab
            onClick={() => selectTab(tab.id)}
            isSelected={tab.id === selectedTab}
            key={tab.id}
            data-test-subject={tab.testSubj}
          >
            {tab.name}
          </EuiTab>
        ))}
      </EuiTabs>

      {(selectedTab === 'indices') && (
        <Switch>
          <Redirect exact from={`${BASE_PATH}`} to={`${BASE_PATH}indices`} />
          <Route exact path={`${BASE_PATH}indices`} component={IndexList} />
          <Route path={`${BASE_PATH}indices/filter/:filter?`} component={IndexList} />
        </Switch>
      )}

      {(selectedTab === 'index_templates') && <IndexTemplateList />}
      {(selectedTab === 'reindexing_list') && <ReindexingList />}
    </EuiPageContent>
  );
};
