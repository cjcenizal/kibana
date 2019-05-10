/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment, useState } from 'react';
import { EuiButton, EuiConfirmModal, EuiOverlayMask, EuiToolTip, EuiButtonIcon, EuiInMemoryTable, EuiLink, Query, EuiLoadingSpinner } from '@elastic/eui';
import { withRouter } from "react-router";

import { SnapshotDetails } from '../../../../../../common/types';
import { SNAPSHOT_STATE } from '../../../../constants';
import { useAppDependencies } from '../../../../index';
import { formatDate } from '../../../../services/text';
import { linkToRepository } from '../../../../services/navigation';
import { DataPlaceholder } from '../../../../components';

interface Props {
  snapshots: SnapshotDetails[];
  repositories: string[];
  reload: () => Promise<void>;
  openSnapshotDetails: (repositoryName: string, snapshotId: string) => void;
  repositoryFilter?: string;
}

let restoreName;

export const SnapshotTable: React.FunctionComponent<Props> = ({
  history,
  snapshots,
  repositories,
  reload,
  openSnapshotDetails,
  repositoryFilter,
}) => {
  const {
    core: {
      i18n: { FormattedMessage, translate },
    },
  } = useAppDependencies();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [restoreId, setRestoreId] = useState<boolean>(undefined);

  const columns = [
    {
      field: 'snapshot',
      name: translate('xpack.snapshotRestore.snapshotList.table.snapshotColumnTitle', {
        defaultMessage: 'Snapshot',
      }),
      truncateText: true,
      sortable: true,
      render: (snapshotId: string, snapshot: SnapshotDetails) => (
        <EuiLink onClick={() => openSnapshotDetails(snapshot.repository, snapshotId)}>
          {snapshotId}
        </EuiLink>
      ),
    },
    {
      field: 'repository',
      name: translate('xpack.snapshotRestore.snapshotList.table.repositoryColumnTitle', {
        defaultMessage: 'Repository',
      }),
      truncateText: true,
      sortable: true,
      render: (repositoryName: string) => (
        <EuiLink href={linkToRepository(repositoryName)}>{repositoryName}</EuiLink>
      ),
    },
    {
      field: 'startTimeInMillis',
      name: translate('xpack.snapshotRestore.snapshotList.table.startTimeColumnTitle', {
        defaultMessage: 'Date created',
      }),
      truncateText: true,
      sortable: true,
      render: (startTimeInMillis: number) => (
        <DataPlaceholder data={startTimeInMillis}>{formatDate(startTimeInMillis)}</DataPlaceholder>
      ),
    },
    {
      field: 'durationInMillis',
      name: translate('xpack.snapshotRestore.snapshotList.table.durationColumnTitle', {
        defaultMessage: 'Duration',
      }),
      truncateText: true,
      sortable: true,
      width: '100px',
      render: (durationInMillis: number, { state }: SnapshotDetails) => {
        if (state === SNAPSHOT_STATE.IN_PROGRESS) {
          return <EuiLoadingSpinner size="m" />;
        }
        return (
          <DataPlaceholder data={durationInMillis}>
            <FormattedMessage
              id="xpack.snapshotRestore.snapshotList.table.durationColumnValueLabel"
              defaultMessage="{seconds}s"
              values={{ seconds: Math.ceil(durationInMillis / 1000) }}
            />
          </DataPlaceholder>
        );
      },
    },
    {
      field: 'indices',
      name: translate('xpack.snapshotRestore.snapshotList.table.indicesColumnTitle', {
        defaultMessage: 'Indices',
      }),
      truncateText: true,
      sortable: true,
      width: '100px',
      render: (indices: string[]) => indices.length,
    },
    {
      field: 'shards.total',
      name: translate('xpack.snapshotRestore.snapshotList.table.shardsColumnTitle', {
        defaultMessage: 'Shards',
      }),
      truncateText: true,
      sortable: true,
      width: '100px',
      render: (totalShards: number) => totalShards,
    },
    {
      field: 'shards.failed',
      name: translate('xpack.snapshotRestore.snapshotList.table.failedShardsColumnTitle', {
        defaultMessage: 'Failed shards',
      }),
      truncateText: true,
      sortable: true,
      width: '100px',
      render: (failedShards: number) => failedShards,
    },
    {
      name: 'Actions',
      render: ({ uuid }) => {
        if (restoreId === uuid) {
          return  <EuiLoadingSpinner size="m" />;
        }

        const label = 'Restore snapshot'

        return (
          <EuiToolTip content={label} delay="long">
            <EuiButtonIcon
              aria-label="Restore snapshot"
              iconType="editorUndo"
              color="primary"
              onClick={() => { setIsModalOpen(true); restoreName = uuid; }}
            />
          </EuiToolTip>
        );
      },
      width: '100px',
    },
  ];

  // By default, we'll display the most recent snapshots at the top of the table.
  const sorting = {
    sort: {
      field: 'startTimeInMillis',
      direction: 'desc',
    },
  };

  const pagination = {
    initialPageSize: 20,
    pageSizeOptions: [10, 20, 50],
  };

  const searchSchema = {
    fields: {
      repository: {
        type: 'string',
      },
    },
  };

  const search = {
    toolsRight: (
      <EuiButton color="secondary" iconType="refresh" onClick={reload}>
        <FormattedMessage
          id="xpack.snapshotRestore.snapshotList.table.reloadSnapshotsButton"
          defaultMessage="Reload"
        />
      </EuiButton>
    ),
    box: {
      incremental: true,
      schema: searchSchema,
    },
    filters: [
      {
        type: 'field_value_selection',
        field: 'repository',
        name: 'Repository',
        multiSelect: false,
        options: repositories.map(repository => ({
          value: repository,
          view: repository,
        })),
      },
    ],
    defaultQuery: repositoryFilter
      ? Query.parse(`repository:'${repositoryFilter}'`, {
          schema: {
            ...searchSchema,
            strict: true,
          },
        })
      : '',
  };

  const renderModal = () => {
    if (!isModalOpen) {
      return null;
    }

    return (
      <EuiOverlayMask>
        <EuiConfirmModal
          title="Restore snapshot?"
          onCancel={() => setIsModalOpen(false)}
          onConfirm={() => { setRestoreId(restoreName); setIsModalOpen(false); }}
          cancelButtonText="Cancel"
          confirmButtonText="Restore all indices in snapshot"
          buttonColor="primary"
          data-test-subj="srDeleteRepositoryConfirmationModal"
        >
          <p>
            This will restore all the indices in this snapshot but won't restore the global cluster state.
          </p>

          <p>
            Use <EuiLink href="#">Advanced Snapshot Restore</EuiLink> if you want to select the indices to restore, restore the global cluster state, or customize the index settings.
          </p>
        </EuiConfirmModal>
      </EuiOverlayMask>
    );
  };

  return (
    <Fragment>
      <EuiInMemoryTable
        items={snapshots}
        itemId="name"
        columns={columns}
        search={search}
        sorting={sorting}
        pagination={pagination}
        rowProps={() => ({
          'data-test-subj': 'srSnapshotListTableRow',
        })}
        cellProps={(item: any, column: any) => ({
          'data-test-subj': `srSnapshotListTableCell-${column.field}`,
        })}
      />
      {renderModal()}
    </Fragment>
  );
};
