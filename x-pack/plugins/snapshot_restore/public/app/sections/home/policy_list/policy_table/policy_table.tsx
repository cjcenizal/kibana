/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import {
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiLink,
  EuiToolTip,
} from '@elastic/eui';

import { BASE_PATH } from '../../../../constants';
import { useAppDependencies } from '../../../../index';

const PolicyTableUi: React.FunctionComponent<Props> = ({
  policies,
  history,
}) => {
  const {
    core: { i18n },
  } = useAppDependencies();
  const { FormattedMessage } = i18n;
  const [selectedItems, setSelectedItems] = useState<Policy[]>([]);

  const columns = [
    {
      field: 'name',
      name: 'Policy',
      truncateText: true,
      sortable: true,
      render: (name: string) => {
        return <EuiLink onClick={() => {}}>{name}</EuiLink>;
      },
    },
    {
      field: 'repository',
      name: 'Repository',
      truncateText: true,
      sortable: true,
      render: (repository: string) => (
        <EuiLink href="#">{repository}</EuiLink>
      ),
    },
    {
      field: 'indices',
      name: 'Indices',
      truncateText: true,
      sortable: true,
    },
    {
      field: 'nextExecution',
      name: 'Next execution',
      truncateText: true,
      sortable: true,
    },
    {
      name: 'Actions',
      actions: [
        {
          render: ({ name }: { name: string }) => {
            const label = i18n.translate(
              'xpack.snapshotRestore.repositoryList.table.actionEditTooltip',
              { defaultMessage: 'Edit' }
            );

            return (
              <EuiToolTip content={label} delay="long">
                <EuiButtonIcon
                  aria-label={i18n.translate(
                    'xpack.snapshotRestore.repositoryList.table.actionEditAriaLabel',
                    {
                      defaultMessage: 'Edit policy `{name}`',
                      values: { name },
                    }
                  )}
                  iconType="pencil"
                  color="primary"
                  href={`#${BASE_PATH}/edit_policy/${name}`}
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
                  aria-label={i18n.translate(
                    'xpack.snapshotRestore.repositoryList.table.actionRemoveAriaLabel',
                    {
                      defaultMessage: 'Remove policy `{name}`',
                      values: { name },
                    }
                  )}
                  iconType="trash"
                  color="danger"
                  data-test-subj="srPolicyListDeleteActionButton"
                  onClick={() => deletePolicyPrompt([name], onPolicyDeleted)}
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
      field: 'name',
      direction: 'asc',
    },
  };

  const pagination = {
    initialPageSize: 20,
    pageSizeOptions: [10, 20, 50],
  };

  const selection = {
    onSelectionChange: (newSelectedItems: Policy[]) => setSelectedItems(newSelectedItems),
  };

  const search = {
    toolsLeft: selectedItems.length ? (
      <EuiButton
        onClick={() => {}}
        color="danger"
        data-test-subj="srPolicyListBulkDeleteActionButton"
      >
        {selectedItems.length === 1 ? (
          <FormattedMessage
            id="xpack.snapshotRestore.repositoryList.table.deleteSinglePolicyButton"
            defaultMessage="Remove policy"
          />
        ) : (
          <FormattedMessage
            id="xpack.snapshotRestore.repositoryList.table.deleteMultipleRepositoriesButton"
            defaultMessage="Remove policies"
          />
        )}
      </EuiButton>
    ) : (
      undefined
    ),
    toolsRight: (
      <EuiFlexGroup gutterSize="m" justifyContent="spaceAround">
        <EuiFlexItem>
          <EuiButton color="secondary" iconType="refresh" onClick={() => {}}>
            <FormattedMessage
              id="xpack.snapshotRestore.repositoryList.table.reloadRepositoriesButton"
              defaultMessage="Reload"
            />
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiButton
            href={history.createHref({
              pathname: `${BASE_PATH}/add_policy`,
            })}
            fill
            iconType="plusInCircle"
            data-test-subj="srRepositoriesAddButton"
          >
            <FormattedMessage
              id="xpack.snapshotRestore.repositoryList.addPolicyButtonLabel"
              defaultMessage="Create policy"
            />
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
    <EuiInMemoryTable
      items={policies}
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
      cellProps={(item: any, column: any) => ({
        'data-test-subj': `srPolicyListTableCell-${column.field}`,
      })}
    />
  );
};

export const PolicyTable = withRouter(PolicyTableUi);
