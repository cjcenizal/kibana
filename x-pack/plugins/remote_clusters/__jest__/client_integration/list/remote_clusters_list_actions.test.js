/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { act } from 'react-dom/test-utils';

import { PROXY_MODE, SNIFF_MODE } from '../../../common/constants';
import { setupEnvironment, findTestSubject } from '../helpers';
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

  let testBed;

  beforeEach(async () => {
    // The table orders the remote clusters alphabetically by name. So the names chosen here drive
    // test determinism.
    httpRequestsMockHelpers.setLoadRemoteClustersResponse([
      {
        name: 'remoteCluster1',
        isConnected: true,
        connectedSocketsCount: 0,
        proxyAddress: 'localhost:9500',
        isConfiguredByNode: false,
        mode: SNIFF_MODE,
        hasDeprecatedProxySetting: false,
        seeds: ['localhost:9400'],
        connectedNodesCount: 1,
        maxConnectionsPerCluster: 3,
        initialConnectTimeout: '30s',
        skipUnavailable: false,
      },
      {
        name: 'remoteCluster2',
        isConnected: false,
        connectedSocketsCount: 0,
        proxyAddress: 'localhost:9500',
        isConfiguredByNode: true,
        mode: PROXY_MODE,
        seeds: null,
        connectedNodesCount: null,
        maxConnectionsPerCluster: 3,
        initialConnectTimeout: '30s',
        skipUnavailable: false,
      },
      {
        name: 'remoteCluster3',
        isConnected: false,
        connectedSocketsCount: 0,
        proxyAddress: 'localhost:9500',
        isConfiguredByNode: false,
        mode: PROXY_MODE,
        hasDeprecatedProxySetting: true,
        seeds: null,
        connectedNodesCount: null,
        maxConnectionsPerCluster: 3,
        initialConnectTimeout: '30s',
        skipUnavailable: false,
      },
    ]);
    testBed = await setup();
  });

  describe('bulk delete button', () => {
    test('should be visible when a remote cluster is selected', () => {
      const { exists, actions } = testBed;
      expect(exists('remoteClusterBulkDeleteButton')).toBe(false);

      actions.selectRemoteClusterAt(0);

      expect(exists('remoteClusterBulkDeleteButton')).toBe(true);
    });

    test('should update the button label if more than 1 remote cluster is selected', () => {
      const { find, actions } = testBed;
      actions.selectRemoteClusterAt(0);

      const button = find('remoteClusterBulkDeleteButton');
      expect(button.text()).toEqual('Remove remote cluster');

      actions.selectRemoteClusterAt(1);
      expect(button.text()).toEqual('Remove 2 remote clusters');
    });

    test('should open a confirmation modal when clicking on it', () => {
      const { exists, actions } = testBed;
      expect(exists('remoteClustersDeleteConfirmModal')).toBe(false);

      actions.selectRemoteClusterAt(0);
      actions.clickBulkDeleteButton();

      expect(exists('remoteClustersDeleteConfirmModal')).toBe(true);
    });
  });

  describe('table row actions', () => {
    test('should have a "delete" and an "edit" action button on each row', () => {
      const { getRemoteClustersTableRows } = testBed;
      const rows = getRemoteClustersTableRows();
      const indexLastColumn = rows[0].columns.length - 1;
      const tableCellActions = rows[0].columns[indexLastColumn].reactWrapper;

      const deleteButton = findTestSubject(tableCellActions, 'remoteClusterTableRowRemoveButton');
      const editButton = findTestSubject(tableCellActions, 'remoteClusterTableRowEditButton');

      expect(deleteButton.length).toBe(1);
      expect(editButton.length).toBe(1);
    });

    test('should open a confirmation modal when clicking on "delete" button', async () => {
      const { exists, actions } = testBed;
      expect(exists('remoteClustersDeleteConfirmModal')).toBe(false);

      actions.clickRowActionButtonAt(0, 'delete');

      expect(exists('remoteClustersDeleteConfirmModal')).toBe(true);
    });
  });

  describe('confirmation modal (delete remote cluster)', () => {
    test('should remove the remote cluster from the table after delete is successful', async () => {
      const { actions, getRemoteClustersTableRows, component } = testBed;
      // Mock HTTP DELETE request
      httpRequestsMockHelpers.setDeleteRemoteClusterResponse({
        itemsDeleted: ['remoteCluster1'],
        errors: [],
      });

      let rows = getRemoteClustersTableRows();
      // Make sure that we have our 3 remote clusters in the table
      expect(rows.length).toBe(3);

      actions.selectRemoteClusterAt(0);
      actions.clickBulkDeleteButton();
      actions.clickConfirmModalDeleteRemoteCluster();

      await act(async () => {
        jest.advanceTimersByTime(600); // there is a 500ms timeout in the api action
      });

      component.update();

      rows = getRemoteClustersTableRows();
      expect(rows.length).toBe(2);
      expect(rows[0].columns[1].value).toEqual('remoteCluster2');
    });
  });
});
