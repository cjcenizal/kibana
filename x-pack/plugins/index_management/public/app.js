/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment, useEffect } from 'react';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';

import chrome from 'ui/chrome';

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

import { UIM_APP_LOAD } from '../common/constants';
import { ReindexWizard } from './sections/reindex_wizard';
import { IndexTemplateForm } from './sections/index_template_form';
import { IndexList } from './sections/index_list';
import { IndexTemplateList } from './sections/index_template_list';
import { ReindexingList } from './sections/reindexing_list';
import { trackUiMetric } from './services';

const BASE_PATH = '/management/elasticsearch/index_management';

export const App = () => {
  useEffect(() => trackUiMetric(UIM_APP_LOAD), []);

  return (
    <HashRouter>
      <AppWithoutRouter />
    </HashRouter>
  );
};

const Home = ({ match, history }) => {
  const urlParts = match.url.split('/');
  const selectedTab = urlParts[urlParts.length - 1];

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
      id: 'reindex_tasks',
      name: 'Reindex tasks',
    },
  ];

  switch (selectedTab) {
    case 'indices':
      chrome.breadcrumbs.set([
        { text: 'Management', href: '#/management/elasticsearch' },
        { text: 'Index management', href: '#/management/elasticsearch/index_management' },
        { text: 'Indices' },
      ]);
      break;

    case 'index_templates':
      chrome.breadcrumbs.set([
        { text: 'Management', href: '#/management/elasticsearch' },
        { text: 'Index management', href: '#/management/elasticsearch/index_management' },
        { text: 'Index templates' },
      ]);
      break;

    case 'reindexing_list':
      chrome.breadcrumbs.set([
        { text: 'Management', href: '#/management/elasticsearch' },
        { text: 'Index management', href: '#/management/elasticsearch/index_management' },
        { text: 'Reindex tasks' },
      ]);
      break;
  }

  return (
    <Fragment>
      <EuiTitle size="m">
        <h1>
          Index Management
        </h1>
      </EuiTitle>

      <EuiSpacer size="s" />

      <EuiTabs>
        {tabs.map(tab => (
          <EuiTab
            onClick={() => history.push(`/management/elasticsearch/index_management/${tab.id}`)}
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
          <Route exact path={`${BASE_PATH}/indices`} component={IndexList} />
          <Route path={`${BASE_PATH}/indices/filter/:filter?`} component={IndexList} />
        </Switch>
      )}

      {(selectedTab === 'index_templates') && <IndexTemplateList />}
      {(selectedTab === 'reindex_tasks') && <ReindexingList />}
    </Fragment>
  );
};

// Exoprt this so we can test it with a different router.
export const AppWithoutRouter = () => {

  return (
    <EuiPageContent>
      <Switch>
        <Redirect exact from={`${BASE_PATH}/`} to={`${BASE_PATH}/indices`} />
        <Route exact path={`${BASE_PATH}/reindex`} component={ReindexWizard} />
        <Route exact path={`${BASE_PATH}/create_index_template`} component={IndexTemplateForm} />
        <Route path={`${BASE_PATH}/:tab`} component={Home} />
      </Switch>
    </EuiPageContent>
  );
};
