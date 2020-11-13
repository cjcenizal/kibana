/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { PROXY_MODE, SNIFF_MODE } from '../../../common/constants';

// The table orders the remote clusters alphabetically by name. So the names chosen here drive
// test determinism.
export const loadRemoteClustersResponse = [
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
];
