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

import { Reducer } from 'react';
import { produce } from 'immer';
import { identity } from 'fp-ts/lib/function';
import { DevToolsSettings } from '../../services';
import { TextObject } from '../../../common/text_object';

export interface Store {
  ready: boolean;
  settings: DevToolsSettings;
  currentTextObjectId: string;
  textObjects: Record<string, TextObject>;
}

export const initialValue: Store = produce<Store>(
  {
    ready: false,
    settings: null as any,
    currentTextObjectId: '',
    textObjects: {},
  },
  identity
);

export type Action =
  | { type: 'setInputEditor'; payload: any }
  | { type: 'updateSettings'; payload: DevToolsSettings }
  | { type: 'textObject.setCurrent'; payload: string }
  | { type: 'textObject.upsertMany'; payload: TextObject[] }
  | { type: 'textObject.upsert'; payload: TextObject }
  | { type: 'textObject.upsertAndSetCurrent'; payload: TextObject };

export const reducer: Reducer<Store, Action> = (state, action) =>
  produce<Store>(state, draft => {
    if (action.type === 'setInputEditor') {
      if (action.payload) {
        draft.ready = true;
      }
      return;
    }

    if (action.type === 'updateSettings') {
      draft.settings = action.payload;
      return;
    }

    if (action.type === 'textObject.setCurrent') {
      draft.currentTextObjectId = action.payload;
      return;
    }

    if (action.type === 'textObject.upsertAndSetCurrent') {
      draft.currentTextObjectId = action.payload.id;
      draft.textObjects[action.payload.id] = action.payload;
      return;
    }

    if (action.type === 'textObject.upsert' || action.type === 'textObject.upsertMany') {
      const objectsArray = Array.isArray(action.payload) ? action.payload : [action.payload];
      for (const object of objectsArray) {
        draft.textObjects[object.id] = object;
      }
      return;
    }

    return draft;
  });
