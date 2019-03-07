/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const listeners = {};
const pageIdToMaximizedState = {};

export function addViewSizeEventListener(id, listener) {
  if (!listeners[id]) {
    listeners[id] = [];
  }

  if (listeners[id].includes(listener)) {
    return;
  }

  listeners[id].push(listener);
};

export function removeViewSizeEventLister(id, listener) {
  const index = listeners[id].indexOf(listener);
  if (index !== -1) {
    listeners[id].splice(index, 1);
  }
};

export function minimizePageSize(id) {
  if (id == null) {
    throw('Expected an id');
  }

  pageIdToMaximizedState[id] = false;

  if (listeners[id]) {
    listeners[id].map(listener => listener(false));
  }
}

export function maximizePageSize(id) {
  if (id == null) {
    throw('Expected an id');
  }

  pageIdToMaximizedState[id] = true;

  if (listeners[id]) {
    listeners[id].map(listener => listener(true));
  }
}

export function getPageSizeMaximized(id) {
  if (id == null) {
    throw('Expected an id');
  }

  return Boolean(pageIdToMaximizedState[id]);
}
