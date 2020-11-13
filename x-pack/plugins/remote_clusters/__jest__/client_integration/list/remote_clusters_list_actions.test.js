/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { act } from 'react-dom/test-utils';

import { getRouter } from '../../../public/application/services';
import { getRemoteClusterMock } from '../../../fixtures/remote_cluster';

import { PROXY_MODE } from '../../../common/constants';

import { setupEnvironment, getRandomString, findTestSubject } from '../helpers';

import { setup } from './remote_clusters_list.helpers';

describe('<RemoteClusterList />', () => {
  const { server, httpRequestsMockHelpers } = setupEnvironment();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
    server.restore();
  });

  httpRequestsMockHelpers.setLoadRemoteClustersResponse([]);

  let find;
  let exists;
  let component;
  let table;
  let actions;
  let tableCellsValues;
  let rows;

  // The table orders the remote clusters alphabetically by name. So the names chosen here drive
  // test determinism.
  const remoteCluster1 = getRemoteClusterMock({ name: 'remoteCluster1' });
  const remoteCluster2 = getRemoteClusterMock({
    name: 'remoteCluster2',
    isConnected: false,
    connectedSocketsCount: 0,
    proxyAddress: 'localhost:9500',
    isConfiguredByNode: true,
    mode: PROXY_MODE,
    seeds: null,
    connectedNodesCount: null,
  });
  const remoteCluster3 = getRemoteClusterMock({
    name: 'remoteCluster3',
    isConnected: false,
    connectedSocketsCount: 0,
    proxyAddress: 'localhost:9500',
    isConfiguredByNode: false,
    mode: PROXY_MODE,
    hasDeprecatedProxySetting: true,
    seeds: null,
    connectedNodesCount: null,
  });

  const remoteClusters = [remoteCluster1, remoteCluster2, remoteCluster3];

  beforeEach(async () => {
    httpRequestsMockHelpers.setLoadRemoteClustersResponse(remoteClusters);

    await act(async () => {
      ({ component, find, exists, table, actions } = setup());
    });

    component.update();

    // Read the remote clusters list table
    ({ rows, tableCellsValues } = table.getMetaData('remoteClusterListTable'));
  });

  describe('bulk delete button', () => {
    test('should be visible when a remote cluster is selected', () => {
      expect(exists('remoteClusterBulkDeleteButton')).toBe(false);

      actions.selectRemoteClusterAt(0);

      expect(exists('remoteClusterBulkDeleteButton')).toBe(true);
    });

    test('should update the button label if more than 1 remote cluster is selected', () => {
      actions.selectRemoteClusterAt(0);

      const button = find('remoteClusterBulkDeleteButton');
      expect(button.text()).toEqual('Remove remote cluster');

      actions.selectRemoteClusterAt(1);
      expect(button.text()).toEqual('Remove 2 remote clusters');
    });

    test('should open a confirmation modal when clicking on it', () => {
      expect(exists('remoteClustersDeleteConfirmModal')).toBe(false);

      actions.selectRemoteClusterAt(0);
      actions.clickBulkDeleteButton();

      expect(exists('remoteClustersDeleteConfirmModal')).toBe(true);
    });
  });

  describe('table row actions', () => {
    test('should have a "delete" and an "edit" action button on each row', () => {
      const indexLastColumn = rows[0].columns.length - 1;
      const tableCellActions = rows[0].columns[indexLastColumn].reactWrapper;

      const deleteButton = findTestSubject(tableCellActions, 'remoteClusterTableRowRemoveButton');
      const editButton = findTestSubject(tableCellActions, 'remoteClusterTableRowEditButton');

      expect(deleteButton.length).toBe(1);
      expect(editButton.length).toBe(1);
    });

    test('should open a confirmation modal when clicking on "delete" button', async () => {
      expect(exists('remoteClustersDeleteConfirmModal')).toBe(false);

      actions.clickRowActionButtonAt(0, 'delete');

      expect(exists('remoteClustersDeleteConfirmModal')).toBe(true);
    });
  });

  describe('confirmation modal (delete remote cluster)', () => {
    test('should remove the remote cluster from the table after delete is successful', async () => {
      // Mock HTTP DELETE request
      httpRequestsMockHelpers.setDeleteRemoteClusterResponse({
        itemsDeleted: [remoteCluster1.name],
        errors: [],
      });

      // Make sure that we have our 3 remote clusters in the table
      expect(rows.length).toBe(3);

      actions.selectRemoteClusterAt(0);
      actions.clickBulkDeleteButton();
      actions.clickConfirmModalDeleteRemoteCluster();

      await act(async () => {
        jest.advanceTimersByTime(600); // there is a 500ms timeout in the api action
      });

      component.update();

      ({ rows } = table.getMetaData('remoteClusterListTable'));

      expect(rows.length).toBe(2);
      expect(rows[0].columns[1].value).toEqual(remoteCluster2.name);
    });
  });
});
