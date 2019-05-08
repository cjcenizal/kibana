/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { EuiButton, EuiEmptyPrompt } from '@elastic/eui';
import { Repository } from '../../../../../common/types';

import { PolicyTable } from './policy_table';

export const PolicyList: React.FunctionComponent<RouteComponentProps<MatchParams>> = () => {
  const policies = [
    {
      name: 'web_logs_backup',
      repository: 'general_s3_repo',
      indices: 'wl-2019-*,wl-2018-*',
      nextExecution: '3 days',
    },
    {
      name: 'access_logs_backup',
      repository: 'general_s3_repo',
      indices: 'access-*',
      nextExecution: '1 weeks, 1 day',
    },
    {
      name: 'experiments',
      repository: 'experiments_s3_repo',
      indices: 'experiment1,susan-marketing-prototype,susan-website',
      nextExecution: 'August 5, 2019',
    },
    {
      name: 'client_history',
      repository: 'clients_azure_repo',
      indices: 'client*',
      nextExecution: 'June 22, 2019',
    }
  ];

  const content = (
    <PolicyTable
      policies={policies || []}
    />
  );

  return (
    <Fragment>
      {content}
    </Fragment>
  );
};
