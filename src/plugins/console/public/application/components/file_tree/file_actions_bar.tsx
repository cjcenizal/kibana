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
import { i18n } from '@kbn/i18n';
import React, { FunctionComponent, useState } from 'react';
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiLoadingSpinner,
  EuiPopover,
} from '@elastic/eui';

import { FileForm } from './forms';

export interface Props {
  onCreate: (fileName: string) => void;
  onFilter: () => void;
  disabled?: boolean;
  fileActionInProgress?: boolean;
}

export const FileActionsBar: FunctionComponent<Props> = ({
  onCreate,
  onFilter,
  disabled,
  fileActionInProgress,
}) => {
  const [showCreateFilePopover, setShowCreateFilePopover] = useState(false);

  const setShowPopover = (popover: 'create' | 'edit' | false) => {
    switch (popover) {
      case 'create':
        setShowCreateFilePopover(true);
        break;
      case false:
      default:
        setShowCreateFilePopover(false);
    }
  };

  return (
    <EuiFlexGroup
      justifyContent="center"
      alignItems="center"
      gutterSize="none"
      className="conApp__fileTree__actionBar"
    >
      <EuiFlexItem>
        <EuiText size="s">
          {i18n.translate('console.fileTree.title', { defaultMessage: 'Files' })}
        </EuiText>
      </EuiFlexItem>
      {fileActionInProgress && (
        <EuiFlexItem className="conApp__fileTree__spinner" grow={false}>
          <EuiLoadingSpinner size="m" />
        </EuiFlexItem>
      )}

      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          disabled={disabled}
          onClick={() => {
            setShowPopover(false);
            onFilter();
          }}
          color="ghost"
          aria-label={i18n.translate('console.fileTree.forms.createButtonAriaLabel', {
            defaultMessage: 'Toggle file filter',
          })}
          iconType="search"
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiPopover
          isOpen={showCreateFilePopover && !disabled}
          closePopover={() => setShowPopover(false)}
          button={
            <EuiButtonIcon
              disabled={disabled}
              onClick={() => {
                setShowPopover('create');
              }}
              color="ghost"
              aria-label={i18n.translate('console.fileTree.forms.createButtonAriaLabel', {
                defaultMessage: 'Create a file',
              })}
              iconType="plusInCircle"
            />
          }
        >
          <FileForm
            isSubmitting={Boolean(disabled)}
            onSubmit={(fileName: string) => {
              onCreate(fileName);
              setShowPopover(false);
            }}
          />
        </EuiPopover>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
