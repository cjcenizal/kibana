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

import React, { useState, FunctionComponent } from 'react';
import classNames from 'classnames';
import { EuiFlexGroup, EuiFlexItem, EuiTreeView, EuiIcon, EuiLoadingSpinner } from '@elastic/eui';

import { useEditorReadContext, useEditorActionContext } from '../../../contexts';
import { useTextObjectsCRUD } from '../../../hooks/text_objects';
import { FileActionsBar, FileSearchBar, DeleteFileModal } from '../../../components';

import { filterTextObjects } from './filter_text_objects';

export const FileTree: FunctionComponent = () => {
  const [searchFilter, setSearchFilter] = useState<string | null>(null);
  const [isFileActionInProgress, setIsFileActionInProgress] = useState(false);
  const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);
  const [showFileSearchBar, setShowFileSearchBar] = useState(false);

  const textObjectsCRUD = useTextObjectsCRUD();
  const { textObjects, currentTextObjectId } = useEditorReadContext();
  const dispatch = useEditorActionContext();

  const currentTextObject = textObjects[currentTextObjectId];

  const filteredTextObjects = searchFilter
    ? filterTextObjects(searchFilter, textObjects)
    : Object.values(textObjects);

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
            disabled={isFileActionInProgress}
            canDelete={!currentTextObject.isScratchPad}
            currentTextObject={currentTextObject}
            canEdit={!currentTextObject.isScratchPad}
            onEdit={fileName => {
              setIsFileActionInProgress(true);
              textObjectsCRUD
                .update({
                  textObject: {
                    ...currentTextObject,
                    name: fileName,
                  },
                })
                .finally(() => {
                  setIsFileActionInProgress(false);
                });
            }}
            onDelete={() => setShowDeleteFileModal(true)}
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
          {isFileActionInProgress ? (
            <div className="conApp__fileTree__spinner">
              <EuiLoadingSpinner size="xl" />
            </div>
          ) : (
            <EuiTreeView
              aria-label="File tree view"
              display="compressed"
              items={filteredTextObjects
                .sort((a, b) => (a.isScratchPad ? 1 : a.createdAt - b.createdAt))
                .map(({ isScratchPad, name, id }, idx) => {
                  return {
                    id,
                    className: classNames({
                      conApp__fileTree__scratchPadEntry: isScratchPad,
                      conApp__fileTree__entry: true,
                      'conApp__fileTree__entry--selected': id === currentTextObjectId,
                    }),
                    label: isScratchPad ? 'Scratch Pad' : name ?? `Untitled`,
                    icon: isScratchPad ? <EuiIcon size="s" type="pencil" /> : undefined,
                    useEmptyIcon: !isScratchPad,
                    callback: () => {
                      dispatch({
                        type: 'textObject.setCurrent',
                        payload: id,
                      });
                      return '';
                    },
                  };
                })}
            />
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
      {showDeleteFileModal && (
        <DeleteFileModal
          fileName={currentTextObject.name || 'Untitled'}
          onClose={() => setShowDeleteFileModal(false)}
          onDeleteConfirmation={() => {
            setIsFileActionInProgress(true);
            setShowDeleteFileModal(false);
            textObjectsCRUD.delete(currentTextObject).finally(() => {
              setIsFileActionInProgress(false);
            });
          }}
        />
      )}
    </>
  );
};
