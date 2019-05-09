/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useState, Fragment } from 'react';
import { i18n } from '@kbn/i18n';
import { Route } from 'react-router-dom';

import {
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiIcon,
  EuiSpacer,
  EuiLink,
  EuiText,
  EuiProgress,
  EuiToolTip,
} from '@elastic/eui';

const reindexTasks = [
  {
    id: '3465',
    source: 'twitter',
    dest: 'new_twitter',
    total: 67249,
    updated: 2132,
    versionConflicts: 0,
    retries: 2,
    startTime: 'May 14, 2019 12:56',
  },
  {
    id: '4122',
    source: 'facebook',
    dest: 'new_facebook',
    total: 27249,
    updated: 10132,
    versionConflicts: 1,
    retries: 0,
    startTime: 'May 14, 2019 12:59',
  },
  {
    id: '4190',
    source: 'myspace',
    dest: 'new_myspace_wait_thats_not_a_thing',
    total: 7249,
    updated: 6132,
    versionConflicts: 0,
    retries: 0,
    startTime: 'May 14, 2019 13:11',
  },
];

export const ReindexingList = () => {
  const [selectedItems, setSelectedItems] = useState([]);

  const columns = [
    {
      field: 'id',
      name: 'ID',
      truncateText: true,
      sortable: true,
      render: id => (
        <EuiLink
          href="$"
        >
          {id}
        </EuiLink>
      ),
      width: '100px',
    },
    {
      field: 'startTime',
      name: 'Start time',
      truncateText: true,
      sortable: true,
    },
    {
      field: 'source',
      name: 'Source',
      truncateText: true,
      sortable: true,
    },
    {
      field: 'dest',
      name: 'Destination',
      truncateText: true,
      sortable: true,
    },
    {
      field: 'updated',
      name: 'Progress',
      truncateText: true,
      sortable: true,
      render: (updated, { total }) => (
        <EuiProgress value={updated} max={total} size="s" />
      ),
    },
    {
      field: 'versionConflicts',
      name: 'Conflicts',
      truncateText: true,
      sortable: true,
      width: '80px'
    },
    {
      field: 'retries',
      name: 'Retries',
      truncateText: true,
      sortable: true,
      width: '80px'
    },
    {
      name: 'Actions',
      actions: [
        {
          render: ({ name }) => {
            const label = 'Cancel';

            return (
              <EuiToolTip content={label} delay="long">
                <EuiButtonIcon
                  aria-label={`Cancel reindex`}
                  iconType="trash"
                  color="danger"
                  href="#"
                />
              </EuiToolTip>
            );
          },
        },
      ],
      width: '100px',
    },
  ];

  const sorting = {
    sort: {
      field: 'source',
      direction: 'id',
    },
  };

  const pagination = {
    initialPageSize: 20,
    pageSizeOptions: [10, 20, 50],
  };

  const selection = {
    onSelectionChange: (newSelectedItems) => setSelectedItems(newSelectedItems),
  };

  const search = {
    toolsLeft: selectedItems.length ? (
      <EuiButton
        onClick={() => {}}
        color="danger"
        data-test-subj="srPolicyListBulkDeleteActionButton"
      >
        {selectedItems.length === 1 ? "Delete index template" : "Delete index templates"}
      </EuiButton>
    ) : (
      undefined
    ),
    toolsRight: (
      <EuiFlexGroup gutterSize="m" justifyContent="spaceAround">
        <EuiFlexItem>
          <EuiButton color="secondary" iconType="refresh" onClick={() => {}}>
            Reload
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    ),
    box: {
      incremental: true,
      schema: true,
    },
  };

  return (
    <Fragment>
      <EuiSpacer size="s" />
      <EuiSpacer size="s" />
      <EuiText size="s" color="subdued">
        <p>
          Reindex tasks in progress.
        </p>
      </EuiText>
      <EuiSpacer />
      <EuiInMemoryTable
        items={reindexTasks}
        itemId="name"
        columns={columns}
        search={search}
        sorting={sorting}
        selection={selection}
        pagination={pagination}
        isSelectable={true}
        rowProps={() => ({
          'data-test-subj': 'srPolicyListTableRow',
        })}
        cellProps={(item, column) => ({
          'data-test-subj': `srPolicyListTableCell-${column.field}`,
        })}
      />
    </Fragment>
  );
};
