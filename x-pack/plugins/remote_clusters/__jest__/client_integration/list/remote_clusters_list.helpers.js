/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { act } from 'react-dom/test-utils';
import { registerTestBed, findTestSubject } from '../../../../../test_utils';

import { RemoteClusterList } from '../../../public/application/sections/remote_cluster_list';
import { createRemoteClustersStore } from '../../../public/application/store';
import { registerRouter } from '../../../public/application/services/routing';

const testBedConfig = {
  store: createRemoteClustersStore,
  memoryRouter: {
    onRouter: (router) => registerRouter(router),
  },
};

const initTestBed = registerTestBed(RemoteClusterList, testBedConfig);

export const setup = async () => {
  let testBed;

  await act(async () => {
    testBed = initTestBed();
  });

  testBed.component.update();

  const EUI_TABLE = 'remoteClusterListTable';

  const getRemoteClustersTableRows = () => {
    const { table } = testBed;
    return table.getMetaData(EUI_TABLE).rows;
  };

  const getRemoteClustersTableCellValues = () => {
    const { table } = testBed;
    return table.getMetaData(EUI_TABLE).tableCellsValues;
  };

  // User actions
  const selectRemoteClusterAt = (index = 0) => {
    const rows = getRemoteClustersTableRows();
    const row = rows[index];
    const checkBox = row.reactWrapper.find('input').hostNodes();

    checkBox.simulate('change', { target: { checked: true } });
  };

  const clickBulkDeleteButton = () => {
    const { find } = testBed;
    find('remoteClusterBulkDeleteButton').simulate('click');
  };

  const clickRowActionButtonAt = (index = 0, action = 'delete') => {
    const rows = getRemoteClustersTableRows();
    const indexLastColumn = rows[index].columns.length - 1;
    const tableCellActions = rows[index].columns[indexLastColumn].reactWrapper;

    let button;
    if (action === 'delete') {
      button = findTestSubject(tableCellActions, 'remoteClusterTableRowRemoveButton');
    } else if (action === 'edit') {
      button = findTestSubject(tableCellActions, 'remoteClusterTableRowEditButton');
    }

    if (!button) {
      throw new Error(`Button for action "${action}" not found.`);
    }

    button.simulate('click');
  };

  const clickConfirmModalDeleteRemoteCluster = () => {
    const { find } = testBed;
    const modal = find('remoteClustersDeleteConfirmModal');
    findTestSubject(modal, 'confirmModalConfirmButton').simulate('click');
  };

  const clickRemoteClusterAt = (index = 0) => {
    const rows = getRemoteClustersTableRows();
    const remoteClusterLink = findTestSubject(
      rows[index].reactWrapper,
      'remoteClustersTableListClusterLink'
    );
    remoteClusterLink.simulate('click');
  };

  const clickPaginationNextButton = () => {
    const { find } = testBed;
    find('remoteClusterListTable.pagination-button-next').simulate('click');
  };

  const isDetailPanelVisible = () => {
    const { exists } = testBed;
    return exists('remoteClusterDetailFlyout');
  };

  const getDetailPanelTitle = () => {
    const { find } = testBed;
    return find('remoteClusterDetailsFlyoutTitle').text();
  };

  const getDetailPanelStatusHeading = () => {
    const { find } = testBed;
    return find('remoteClusterDetailPanelStatusSection').find('h3').text();
  };

  return {
    ...testBed,
    getRemoteClustersTableRows,
    getRemoteClustersTableCellValues,
    isDetailPanelVisible,
    getDetailPanelTitle,
    getDetailPanelStatusHeading,
    actions: {
      selectRemoteClusterAt,
      clickBulkDeleteButton,
      clickRowActionButtonAt,
      clickConfirmModalDeleteRemoteCluster,
      clickRemoteClusterAt,
      clickPaginationNextButton,
    },
  };
};
