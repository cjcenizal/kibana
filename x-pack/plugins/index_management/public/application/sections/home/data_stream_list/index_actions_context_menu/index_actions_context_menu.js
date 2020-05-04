/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component, Fragment } from 'react';
import { FormattedMessage } from '@kbn/i18n/react';
import { i18n } from '@kbn/i18n';
import { all } from 'lodash';
import {
  EuiBadge,
  EuiButton,
  EuiCallOut,
  EuiContextMenu,
  EuiFieldNumber,
  EuiForm,
  EuiFormRow,
  EuiPopover,
  EuiSpacer,
  EuiConfirmModal,
  EuiOverlayMask,
  EuiCheckbox,
} from '@elastic/eui';

import { flattenPanelTree } from '../../../../lib/flatten_panel_tree';
import { INDEX_OPEN } from '../../../../../../common/constants';
import { AppContextConsumer } from '../../../../app_context';

export class IndexActionsContextMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPopoverOpen: false,
      renderConfirmModal: null,
      isActionConfirmed: false,
    };
  }
  closeConfirmModal = () => {
    this.setState({
      renderConfirmModal: null,
    });
    this.props.resetSelection && this.props.resetSelection();
  };
  confirmAction = isActionConfirmed => {
    this.setState({ isActionConfirmed });
  };
  panels({ services: { extensionsService } }) {
    const items = [{
      name: i18n.translate('xpack.idxMgmt.indexActionsMenu.deleteIndexLabel', {
        defaultMessage: 'Delete data stream',
      }),
      onClick: () => {
      },
    }, {
      name: i18n.translate('xpack.idxMgmt.indexActionsMenu.deleteIndexLabel', {
        defaultMessage: 'Add lifecycle policy',
      }),
      onClick: () => {
      },
    }];

    const panelTree = {
      id: 0,
      title: i18n.translate('xpack.idxMgmt.indexActionsMenu.panelTitle', {
        defaultMessage: 'Data stream options',
      }),
      items,
    };
    return flattenPanelTree(panelTree);
  }

  onButtonClick = () => {
    this.setState(prevState => ({
      isPopoverOpen: !prevState.isPopoverOpen,
    }));
  };

  closePopoverAndExecute = func => {
    this.setState({
      isPopoverOpen: false,
      renderConfirmModal: false,
    });
    func();
    this.props.resetSelection && this.props.resetSelection();
  };

  closePopover = () => {
    this.setState({
      isPopoverOpen: false,
    });
  };

  forcemergeSegmentsError = () => {
    const { forcemergeSegments } = this.state;
    if (!forcemergeSegments || forcemergeSegments.match(/^([1-9][0-9]*)?$/)) {
      return;
    } else {
      return i18n.translate('xpack.idxMgmt.indexActionsMenu.segmentsNumberErrorMessage', {
        defaultMessage: 'The number of segments must be greater than zero.',
      });
    }
  };

  render() {
    return (
      <AppContextConsumer>
        {appDependencies => {
          const {
            iconSide = 'right',
            anchorPosition = 'rightUp',
            label = i18n.translate('xpack.idxMgmt.indexActionsMenu.manageButtonLabel', {
              defaultMessage: 'Manage data stream',
            }),
            iconType = 'arrowDown',
          } = this.props;

          const panels = this.panels(appDependencies);

          const button = (
            <EuiButton
              data-test-subj="indexActionsContextMenuButton"
              iconSide={iconSide}
              aria-label={i18n.translate('xpack.idxMgmt.indexActionsMenu.manageButtonAriaLabel', {
                defaultMessage:
                  'Data stream options',
              })}
              onClick={this.onButtonClick}
              iconType={iconType}
              fill
            >
              {label}
            </EuiButton>
          );

          return (
            <div>
              {this.state.renderConfirmModal
                ? this.state.renderConfirmModal(this.closeConfirmModal)
                : null}
              <EuiPopover
                id="contextMenuIndices"
                button={button}
                isOpen={this.state.isPopoverOpen}
                closePopover={this.closePopover}
                panelPaddingSize="none"
                withTitle
                anchorPosition={anchorPosition}
                repositionOnScroll
              >
                <EuiContextMenu initialPanelId={0} panels={panels} />
              </EuiPopover>
            </div>
          );
        }}
      </AppContextConsumer>
    );
  }
}
