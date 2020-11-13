/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { setupEnvironment, findTestSubject } from '../helpers';
import {
  loadRemoteClustersResponse,
  loadRemoteClustersResponseMultiplePages,
} from './load_remote_clusters_response';
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

  describe('when there are no remote clusters', () => {
    let testBed;

    beforeEach(async () => {
      httpRequestsMockHelpers.setLoadRemoteClustersResponse([]);
      testBed = await setup();
    });

    test('should display an empty prompt', async () => {
      const { exists } = testBed;
      expect(exists('remoteClusterListEmptyPrompt')).toBe(true);
    });

    test('should have a button to create a remote cluster', async () => {
      const { exists } = testBed;
      expect(exists('remoteClusterEmptyPromptCreateButton')).toBe(true);
    });
  });

  describe('when there are multiple pages of remote clusters', () => {
    let testBed;

    beforeEach(async () => {
      httpRequestsMockHelpers.setLoadRemoteClustersResponse(
        loadRemoteClustersResponseMultiplePages
      );
      testBed = await setup();
    });

    test('pagination works', () => {
      const { actions, getRemoteClustersTableCellValues } = testBed;
      actions.clickPaginationNextButton();
      const cellValues = getRemoteClustersTableCellValues();

      // Pagination defaults to 20 remote clusters per page. We loaded 30 remote clusters,
      // so the second page should have 10.
      expect(cellValues.length).toBe(10);
    });

    // Skipped until we can figure out how to get this test to work.
    test.skip('search works', () => {
      const { form, find, getRemoteClustersTableCellValues } = testBed;
      form.setInputValue(find('remoteClusterSearch'), 'unique');
      const cellValues = getRemoteClustersTableCellValues();
      expect(cellValues.length).toBe(1);
    });
  });

  describe('when there are remote clusters', () => {
    let testBed;

    beforeEach(async () => {
      httpRequestsMockHelpers.setLoadRemoteClustersResponse(loadRemoteClustersResponse);
      testBed = await setup();
    });

    test('should not display the empty prompt', () => {
      const { exists } = testBed;
      expect(exists('remoteClusterListEmptyPrompt')).toBe(false);
    });

    test('should have a button to create a remote cluster', () => {
      const { exists } = testBed;
      expect(exists('remoteClusterCreateButton')).toBe(true);
    });

    test('should list the remote clusters in the table', () => {
      const { getRemoteClustersTableCellValues } = testBed;
      const cellValues = getRemoteClustersTableCellValues();
      expect(cellValues).toEqual([
        [
          '', // Empty because the first column is the checkbox to select the row
          'remoteCluster1',
          'Connected',
          'default',
          'localhost:9400',
          '1',
          '', // Empty because the last column is for the "actions" on the resource
        ],
        ['', 'remoteCluster2', 'Not connected', 'proxy', 'localhost:9500', '0', ''],
        ['', 'remoteCluster3', 'Not connected', 'proxy', 'localhost:9500', '0', ''],
      ]);
    });

    test('should have a tooltip to indicate that the cluster has been defined in elasticsearch.yml', () => {
      const { getRemoteClustersTableRows } = testBed;
      const rows = getRemoteClustersTableRows();
      const secondRow = rows[1].reactWrapper; // The second cluster has been defined by node
      expect(
        findTestSubject(secondRow, 'remoteClustersTableListClusterDefinedByNodeTooltip').length
      ).toBe(1);
    });

    test('should have a tooltip to indicate that the cluster has a deprecated setting', () => {
      const { getRemoteClustersTableRows } = testBed;
      const rows = getRemoteClustersTableRows();
      const secondRow = rows[2].reactWrapper; // The third cluster has been defined with deprecated setting
      expect(
        findTestSubject(secondRow, 'remoteClustersTableListClusterWithDeprecatedSettingTooltip')
          .length
      ).toBe(1);
    });
  });
});
