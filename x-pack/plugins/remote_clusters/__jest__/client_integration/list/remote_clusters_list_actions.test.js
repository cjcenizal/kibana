/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { act } from 'react-dom/test-utils';

import { setupEnvironment, findTestSubject } from '../helpers';
import { loadRemoteClustersResponse } from './load_remote_clusters_response';
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
    httpRequestsMockHelpers.setLoadRemoteClustersResponse(loadRemoteClustersResponse);
    testBed = await setup();
  });

  describe('bulk delete button', () => {
    test('is visible when a remote cluster is selected', () => {
      const { exists, actions } = testBed;
      expect(exists('remoteClusterBulkDeleteButton')).toBe(false);

      actions.selectRemoteClusterAt(0);

      expect(exists('remoteClusterBulkDeleteButton')).toBe(true);
    });

    test('updates the button label if more than 1 remote cluster is selected', () => {
      const { find, actions } = testBed;
      actions.selectRemoteClusterAt(0);

      const button = find('remoteClusterBulkDeleteButton');
      expect(button.text()).toEqual('Remove remote cluster');

      actions.selectRemoteClusterAt(1);
      expect(button.text()).toEqual('Remove 2 remote clusters');
    });

    test('opens a confirmation modal when clicking on it', () => {
      const { exists, actions } = testBed;
      expect(exists('remoteClustersDeleteConfirmModal')).toBe(false);

      actions.selectRemoteClusterAt(0);
      actions.clickBulkDeleteButton();

      expect(exists('remoteClustersDeleteConfirmModal')).toBe(true);
    });
  });

  describe('table row actions', () => {
    test('has a "delete" and an "edit" action button on each row', () => {
      const { getRemoteClustersTableRows } = testBed;
      const rows = getRemoteClustersTableRows();
      const indexLastColumn = rows[0].columns.length - 1;
      const tableCellActions = rows[0].columns[indexLastColumn].reactWrapper;

      const deleteButton = findTestSubject(tableCellActions, 'remoteClusterTableRowRemoveButton');
      const editButton = findTestSubject(tableCellActions, 'remoteClusterTableRowEditButton');

      expect(deleteButton.length).toBe(1);
      expect(editButton.length).toBe(1);
    });

    test('opens a confirmation modal when clicking on "delete" button', async () => {
      const { exists, actions } = testBed;
      expect(exists('remoteClustersDeleteConfirmModal')).toBe(false);

      actions.clickRowActionButtonAt(0, 'delete');

      expect(exists('remoteClustersDeleteConfirmModal')).toBe(true);
    });
  });

  describe('confirmation modal (delete remote cluster)', () => {
    test('removes the remote cluster from the table after delete is successful', async () => {
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
