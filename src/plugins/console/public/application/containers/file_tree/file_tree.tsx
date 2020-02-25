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
import { flow } from 'fp-ts/lib/function';
import React, { useState, FunctionComponent } from 'react';
import classNames from 'classnames';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';

import { sortTextObjectsAsc } from '../../../../common/text_object';
import { Store } from '../../stores/editor';

import { useEditorReadContext, useEditorActionContext } from '../../contexts';
import { useTextObjectsCRUD } from '../../hooks/text_objects';
import {
  FileActionsBar,
  FileSearchBar,
  DeleteFileModal,
  FileTree as FileTreeComponent,
} from '../../components';

import { filterTextObjects } from './filter_text_objects';

const prepareData = flow(
  (searchFilter: string | undefined, textObjects: Store['textObjects']) =>
    searchFilter ? filterTextObjects(searchFilter, textObjects) : Object.values(textObjects),
  sortTextObjectsAsc
);

export const FileTree: FunctionComponent = () => {
  const [searchFilter, setSearchFilter] = useState<string | undefined>(undefined);
  const [isFileActionInProgress, setIsFileActionInProgress] = useState(false);
  const [idToDelete, setIdToDelete] = useState<undefined | string>(undefined);
  const [showFileSearchBar, setShowFileSearchBar] = useState(false);

  const textObjectsCRUD = useTextObjectsCRUD();
  const { textObjects, currentTextObjectId } = useEditorReadContext();
  const dispatch = useEditorActionContext();

  const currentTextObject = textObjects[currentTextObjectId];

  const filteredTextObjects = prepareData(searchFilter, textObjects);

  return (
    <>
      <EuiFlexGroup
        className="conApp__fileTree"
        direction="column"
        gutterSize="none"
        responsive={false}
      >
        {/* File Actions Bar */}
        <EuiFlexItem grow={false}>
          <FileActionsBar
            fileActionInProgress={isFileActionInProgress}
            disabled={isFileActionInProgress}
            onCreate={fileName => {
              setIsFileActionInProgress(true);
              textObjectsCRUD
                .create({
                  textObject: {
                    text: '',
                    updatedAt: Date.now(),
                    createdAt: Date.now(),
                    name: fileName,
                  },
                })
                .finally(() => setIsFileActionInProgress(false));
            }}
            onFilter={() => setShowFileSearchBar(!showFileSearchBar)}
          />
        </EuiFlexItem>
        {/* File Search Bar */}
        {showFileSearchBar && (
          <EuiFlexItem grow={false}>
            <FileSearchBar
              onChange={(searchTerm: string) => {
                setSearchFilter(searchTerm);
              }}
              searchValue={searchFilter ?? ''}
            />
          </EuiFlexItem>
        )}

        {/* File Tree */}
        <EuiFlexItem>
          <FileTreeComponent
            entries={filteredTextObjects
              .sort((a, b) =>
                a.isScratchPad ? -1 : b.isScratchPad ? 1 : a.createdAt - b.createdAt
              )
              .map(({ isScratchPad, name, id }) => {
                return {
                  id,
                  className: classNames({
                    conApp__fileTree__scratchPadEntry: isScratchPad,
                    'conApp__fileTree__entry--selected': id === currentTextObjectId,
                  }),
                  name: isScratchPad ? 'Default' : name ?? `Untitled`,
                  onSelect: () => {
                    dispatch({
                      type: 'textObject.setCurrent',
                      payload: id,
                    });
                  },
                  canDelete: !isScratchPad,
                  onDelete: deleteId => {
                    setIdToDelete(deleteId);
                  },
                  canEdit: !isScratchPad,
                  onEdit: ({ name: fileName, id: idToEdit }) => {
                    setIsFileActionInProgress(true);
                    textObjectsCRUD
                      .update({
                        textObject: {
                          id: idToEdit,
                          name: fileName,
                        },
                      })
                      .finally(() => {
                        setIsFileActionInProgress(false);
                      });
                  },
                };
              })}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      {idToDelete && (
        <DeleteFileModal
          fileName={textObjects[idToDelete]?.name ?? 'Untitled'}
          onClose={() => setIdToDelete(undefined)}
          onDeleteConfirmation={() => {
            setIsFileActionInProgress(true);
            setIdToDelete(undefined);
            textObjectsCRUD.delete(currentTextObject).finally(() => {
              setIsFileActionInProgress(false);
            });
          }}
        />
      )}
    </>
  );
};
