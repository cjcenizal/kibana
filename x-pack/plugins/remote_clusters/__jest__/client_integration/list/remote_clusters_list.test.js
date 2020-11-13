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

  describe('on component mount', () => {
    let exists;

    beforeEach(() => {
      ({ exists } = setup());
    });

    test('should show a "loading remote clusters" indicator', () => {
      expect(exists('remoteClustersTableLoading')).toBe(true);
    });
  });

  describe('when there are no remote clusters', () => {
    let exists;
    let component;

    beforeEach(async () => {
      await act(async () => {
        ({ exists, component } = setup());
      });

      component.update();
    });

    test('should display an empty prompt', async () => {
      expect(exists('remoteClusterListEmptyPrompt')).toBe(true);
    });

    test('should have a button to create a remote cluster', async () => {
      expect(exists('remoteClusterEmptyPromptCreateButton')).toBe(true);
    });
  });

  describe('when there are multiple pages of remote clusters', () => {
    let find;
    let table;
    let actions;
    let component;
    let form;

    const remoteClusters = [
      {
        name: 'unique',
        seeds: [],
      },
    ];

    for (let i = 0; i < 29; i++) {
      remoteClusters.push({
        name: `name${i}`,
        seeds: [],
      });
    }

    beforeEach(async () => {
      httpRequestsMockHelpers.setLoadRemoteClustersResponse(remoteClusters);

      await act(async () => {
        ({ find, table, actions, form, component } = setup());
      });

      component.update();
    });

    test('pagination works', () => {
      actions.clickPaginationNextButton();
      const { tableCellsValues } = table.getMetaData('remoteClusterListTable');

      // Pagination defaults to 20 remote clusters per page. We loaded 30 remote clusters,
      // so the second page should have 10.
      expect(tableCellsValues.length).toBe(10);
    });

    // Skipped until we can figure out how to get this test to work.
    test.skip('search works', () => {
      form.setInputValue(find('remoteClusterSearch'), 'unique');
      const { tableCellsValues } = table.getMetaData('remoteClusterListTable');
      expect(tableCellsValues.length).toBe(1);
    });
  });

  describe('when there are remote clusters', () => {
    let find;
    let exists;
    let component;
    let table;
    let actions;
    let tableCellsValues;
    let rows;

    // For deterministic tests, we need to make sure that remoteCluster1 comes before remoteCluster2
    // in the table list that is rendered. As the table orders alphabetically by index name
    // we prefix the random name to make sure that remoteCluster1 name comes before remoteCluster2.
    const remoteCluster1 = getRemoteClusterMock({ name: `a${getRandomString()}` });
    const remoteCluster2 = getRemoteClusterMock({
      name: `b${getRandomString()}`,
      isConnected: false,
      connectedSocketsCount: 0,
      proxyAddress: 'localhost:9500',
      isConfiguredByNode: true,
      mode: PROXY_MODE,
      seeds: null,
      connectedNodesCount: null,
    });
    const remoteCluster3 = getRemoteClusterMock({
      name: `c${getRandomString()}`,
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

    test('should not display the empty prompt', () => {
      expect(exists('remoteClusterListEmptyPrompt')).toBe(false);
    });

    test('should have a button to create a remote cluster', () => {
      expect(exists('remoteClusterCreateButton')).toBe(true);
    });

    test('should list the remote clusters in the table', () => {
      expect(tableCellsValues.length).toEqual(remoteClusters.length);
      expect(tableCellsValues).toEqual([
        [
          '', // Empty because the first column is the checkbox to select the row
          remoteCluster1.name,
          'Connected',
          'default',
          remoteCluster1.seeds.join(', '),
          remoteCluster1.connectedNodesCount.toString(),
          '', // Empty because the last column is for the "actions" on the resource
        ],
        [
          '',
          remoteCluster2.name,
          'Not connected',
          PROXY_MODE,
          remoteCluster2.proxyAddress,
          remoteCluster2.connectedSocketsCount.toString(),
          '',
        ],
        [
          '',
          remoteCluster3.name,
          'Not connected',
          PROXY_MODE,
          remoteCluster2.proxyAddress,
          remoteCluster2.connectedSocketsCount.toString(),
          '',
        ],
      ]);
    });

    test('should have a tooltip to indicate that the cluster has been defined in elasticsearch.yml', () => {
      const secondRow = rows[1].reactWrapper; // The second cluster has been defined by node
      expect(
        findTestSubject(secondRow, 'remoteClustersTableListClusterDefinedByNodeTooltip').length
      ).toBe(1);
    });

    test('should have a tooltip to indicate that the cluster has a deprecated setting', () => {
      const secondRow = rows[2].reactWrapper; // The third cluster has been defined with deprecated setting
      expect(
        findTestSubject(secondRow, 'remoteClustersTableListClusterWithDeprecatedSettingTooltip')
          .length
      ).toBe(1);
    });
  });
});
