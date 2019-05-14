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
  EuiToolTip,
} from '@elastic/eui';

const indexTemplates = [
  {
    indexPatterns: 'te*, bar*',
    order: 1,
    mappings: {},
  },
  {
    indexPatterns: 'te*, bar*',
    order: 2,
    mappings: {},
    settings: {},
  },
  {
    indexPatterns: '*',
    order: 3,
    mappings: {},
  },
  {
    indexPatterns: 'web-log-*',
    version: 4,
    mappings: {},
  },
  {
    indexPatterns: 'user-metrics-1, user-metrics-2, user-metrics-3',
    mappings: {},
    aliases: {},
    settings: {},
  },
];

export const IndexTemplateList = () => {
  const [selectedItems, setSelectedItems] = useState([]);

  const columns = [
    {
      field: 'indexPatterns',
      name: 'Index patterns',
      truncateText: true,
      sortable: true,
    },
    {
      field: 'order',
      name: 'Order',
      width: '80px',
      truncateText: true,
      sortable: true,
    },
    {
      field: 'version',
      name: 'Version',
      width: '80px',
      truncateText: true,
      sortable: true,
    },
    {
      field: 'mappings',
      name: 'Mappings',
      sortable: true,
      render: (mappings) => {
        if (mappings) {
          return <EuiIcon type="check" />;
        }
      },
      width: '80px',
    },
    {
      field: 'settings',
      name: 'Settings',
      sortable: true,
      render: (settings) => {
        if (settings) {
          return <EuiIcon type="check" />;
        }
      },
      width: '80px',
    },
    {
      field: 'aliases',
      name: 'Aliases',
      sortable: true,
      render: (aliases) => {
        if (aliases) {
          return <EuiIcon type="check" />;
        }
      },
      width: '80px',
    },
    {
      name: 'Actions',
      actions: [
        {
          render: ({ name }) => {
            const label = 'Edit';

            return (
              <EuiToolTip content={label} delay="long">
                <EuiButtonIcon
                  aria-label={`Edit index template ${name}`}
                  iconType="pencil"
                  color="primary"
                  href="#"
                />
              </EuiToolTip>
            );
          },
        },
        {
          render: ({ name }) => {
            return (
              <EuiToolTip content="Remove" delay="long">
                <EuiButtonIcon
                  iconType="trash"
                  color="danger"
                  data-test-subj="srPolicyListDeleteActionButton"
                  onClick={() => {}}
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
      field: 'indexPatterns',
      direction: 'asc',
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
        <EuiFlexItem>
          <EuiButton
            href="#/management/elasticsearch/index_management/create_index_template"
            fill
            iconType="plusInCircle"
            data-test-subj="srRepositoriesAddButton"
          >
            Create index template
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
          Use index templates to automatically apply mappings and other properties to new indices.
        </p>
      </EuiText>
      <EuiSpacer />
      <EuiInMemoryTable
        items={indexTemplates}
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
