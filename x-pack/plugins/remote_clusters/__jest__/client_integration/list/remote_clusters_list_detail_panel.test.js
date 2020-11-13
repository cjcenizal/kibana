/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { getRouter } from '../../../public/application/services';
import { PROXY_MODE, SNIFF_MODE } from '../../../common/constants';
import { setupEnvironment } from '../helpers';
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

  test('opens a detail panel when clicking on a remote cluster', () => {
    const { isDetailPanelVisible, actions } = testBed;
    expect(isDetailPanelVisible()).toBe(false);
    actions.clickRemoteClusterAt(0);
    expect(isDetailPanelVisible()).toBe(true);
  });

  test('sets the title to the remote cluster selected', () => {
    const { getDetailPanelTitle, actions } = testBed;
    actions.clickRemoteClusterAt(0); // Select remote cluster and open the detail panel
    expect(getDetailPanelTitle()).toEqual('remoteCluster1');
  });

  test('has a "Status" section', () => {
    const { getDetailPanelStatusHeading, exists, actions } = testBed;
    actions.clickRemoteClusterAt(0);
    expect(getDetailPanelStatusHeading()).toEqual('Status');
    expect(exists('remoteClusterDetailPanelStatusValues')).toBe(true);
  });

  test('sets the correct remote cluster status values', () => {
    const { find, actions } = testBed;
    actions.clickRemoteClusterAt(0);

    expect(find('remoteClusterDetailIsConnected').text()).toEqual('Connected');
    expect(find('remoteClusterDetailConnectedNodesCount').text()).toEqual('1');
    expect(find('remoteClusterDetailSeeds').text()).toEqual('localhost:9400');
    expect(find('remoteClusterDetailSkipUnavailable').text()).toEqual('No');
    expect(find('remoteClusterDetailMaxConnections').text()).toEqual('3');
    expect(find('remoteClusterDetailInitialConnectTimeout').text()).toEqual('30s');
  });

  test('has a "close", "delete" and "edit" button in the footer', () => {
    const { exists, actions } = testBed;
    actions.clickRemoteClusterAt(0);
    expect(exists('remoteClusterDetailsPanelCloseButton')).toBe(true);
    expect(exists('remoteClusterDetailPanelRemoveButton')).toBe(true);
    expect(exists('remoteClusterDetailPanelEditButton')).toBe(true);
  });

  test('closes the detail panel when clicking the "close" button', () => {
    const { find, isDetailPanelVisible, actions } = testBed;
    actions.clickRemoteClusterAt(0); // open the detail panel
    expect(isDetailPanelVisible()).toBe(true);

    find('remoteClusterDetailsPanelCloseButton').simulate('click');

    expect(isDetailPanelVisible()).toBe(false);
  });

  test('opens a confirmation modal when clicking the "delete" button', () => {
    const { find, exists, actions } = testBed;
    actions.clickRemoteClusterAt(0);
    expect(exists('remoteClustersDeleteConfirmModal')).toBe(false);

    find('remoteClusterDetailPanelRemoveButton').simulate('click');

    expect(exists('remoteClustersDeleteConfirmModal')).toBe(true);
  });

  test('displays a "Remote cluster not found" when providing a wrong cluster name', async () => {
    const { exists, isDetailPanelVisible, component } = testBed;
    expect(isDetailPanelVisible()).toBe(false);

    getRouter().history.replace({ search: `?cluster=wrong-cluster` });
    component.update();

    expect(isDetailPanelVisible()).toBe(true);
    expect(exists('remoteClusterDetailClusterNotFound')).toBe(true);
  });

  test('displays a warning when the cluster is configured by node', () => {
    const { exists, actions } = testBed;
    actions.clickRemoteClusterAt(0); // the remoteCluster1 has *not* been configured by node
    expect(exists('remoteClusterConfiguredByNodeWarning')).toBe(false);

    actions.clickRemoteClusterAt(1); // the remoteCluster2 has been configured by node
    expect(exists('remoteClusterConfiguredByNodeWarning')).toBe(true);
  });
});
