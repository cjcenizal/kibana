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

describe('<RemoteClusterList /> detail panel', () => {
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

  test('should open a detail panel when clicking on a remote cluster', () => {
    expect(exists('remoteClusterDetailFlyout')).toBe(false);

    actions.clickRemoteClusterAt(0);

    expect(exists('remoteClusterDetailFlyout')).toBe(true);
  });

  test('should set the title to the remote cluster selected', () => {
    actions.clickRemoteClusterAt(0); // Select remote cluster and open the detail panel
    expect(find('remoteClusterDetailsFlyoutTitle').text()).toEqual(remoteCluster1.name);
  });

  test('should have a "Status" section', () => {
    actions.clickRemoteClusterAt(0);
    expect(find('remoteClusterDetailPanelStatusSection').find('h3').text()).toEqual('Status');
    expect(exists('remoteClusterDetailPanelStatusValues')).toBe(true);
  });

  test('should set the correct remote cluster status values', () => {
    actions.clickRemoteClusterAt(0);

    expect(find('remoteClusterDetailIsConnected').text()).toEqual('Connected');
    expect(find('remoteClusterDetailConnectedNodesCount').text()).toEqual(
      remoteCluster1.connectedNodesCount.toString()
    );
    expect(find('remoteClusterDetailSeeds').text()).toEqual(remoteCluster1.seeds.join(' '));
    expect(find('remoteClusterDetailSkipUnavailable').text()).toEqual('No');
    expect(find('remoteClusterDetailMaxConnections').text()).toEqual(
      remoteCluster1.maxConnectionsPerCluster.toString()
    );
    expect(find('remoteClusterDetailInitialConnectTimeout').text()).toEqual(
      remoteCluster1.initialConnectTimeout
    );
  });

  test('should have a "close", "delete" and "edit" button in the footer', () => {
    actions.clickRemoteClusterAt(0);
    expect(exists('remoteClusterDetailsPanelCloseButton')).toBe(true);
    expect(exists('remoteClusterDetailPanelRemoveButton')).toBe(true);
    expect(exists('remoteClusterDetailPanelEditButton')).toBe(true);
  });

  test('should close the detail panel when clicking the "close" button', () => {
    actions.clickRemoteClusterAt(0); // open the detail panel
    expect(exists('remoteClusterDetailFlyout')).toBe(true);

    find('remoteClusterDetailsPanelCloseButton').simulate('click');

    expect(exists('remoteClusterDetailFlyout')).toBe(false);
  });

  test('should open a confirmation modal when clicking the "delete" button', () => {
    actions.clickRemoteClusterAt(0);
    expect(exists('remoteClustersDeleteConfirmModal')).toBe(false);

    find('remoteClusterDetailPanelRemoveButton').simulate('click');

    expect(exists('remoteClustersDeleteConfirmModal')).toBe(true);
  });

  test('should display a "Remote cluster not found" when providing a wrong cluster name', async () => {
    expect(exists('remoteClusterDetailFlyout')).toBe(false);

    getRouter().history.replace({ search: `?cluster=wrong-cluster` });
    component.update();

    expect(exists('remoteClusterDetailFlyout')).toBe(true);
    expect(exists('remoteClusterDetailClusterNotFound')).toBe(true);
  });

  test('should display a warning when the cluster is configured by node', () => {
    actions.clickRemoteClusterAt(0); // the remoteCluster1 has *not* been configured by node
    expect(exists('remoteClusterConfiguredByNodeWarning')).toBe(false);

    actions.clickRemoteClusterAt(1); // the remoteCluster2 has been configured by node
    expect(exists('remoteClusterConfiguredByNodeWarning')).toBe(true);
  });
});
