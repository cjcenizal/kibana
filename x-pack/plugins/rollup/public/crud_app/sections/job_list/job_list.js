/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectI18n, FormattedMessage } from '@kbn/i18n/react';
import chrome from 'ui/chrome';
import {
  MANAGEMENT_BREADCRUMB,
  addViewSizeEventListener,
  removeViewSizeEventLister,
  minimizePageSize,
  maximizePageSize,
  getPageSizeMaximized,
} from 'ui/management';

import {
  EuiButton,
  EuiButtonIcon,
  EuiCallOut,
  EuiContextMenu,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingSpinner,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPopover,
  EuiSpacer,
  EuiText,
  EuiTextColor,
  EuiTitle,
} from '@elastic/eui';

import { CRUD_APP_BASE_PATH } from '../../constants';
import { getRouterLinkProps, extractQueryParams, listBreadcrumb } from '../../services';

import {
  JobTable,
} from './job_table';

import {
  DetailPanel,
} from './detail_panel';

const PAGE_ID = 'rollupJobListPage';
const REFRESH_RATE_MS = 30000;

export class JobListUi extends Component {
  static propTypes = {
    loadJobs: PropTypes.func,
    refreshJobs: PropTypes.func,
    openDetailPanel: PropTypes.func,
    hasJobs: PropTypes.bool,
    isLoading: PropTypes.bool,
  }

  static getDerivedStateFromProps(props) {
    const {
      openDetailPanel,
      history: {
        location: {
          search,
        },
      },
    } = props;

    const { job: jobId } = extractQueryParams(search);

    // Show deeplinked job whenever jobs get loaded or the URL changes.
    if (jobId != null) {
      openDetailPanel(jobId);
    }

    return null;
  }

  constructor(props) {
    super(props);

    props.loadJobs();

    chrome.breadcrumbs.set([ MANAGEMENT_BREADCRUMB, listBreadcrumb ]);

    this.state = {
      isPageOptionsOpen: false,
      isPageMaximized: getPageSizeMaximized(PAGE_ID),
    };
  }

  componentDidMount() {
    this.interval = setInterval(this.props.refreshJobs, REFRESH_RATE_MS);
    addViewSizeEventListener(PAGE_ID, this.onPageSizeUpdate)
  }

  componentWillUnmount() {
    clearInterval(this.interval);

    // Close the panel, otherwise it will default to already being open when we navigate back to
    // this page.
    this.props.closeDetailPanel();

    removeViewSizeEventListener(PAGE_ID, this.onPageSizeUpdate);
  }

  onPageSizeUpdate = (isPageMaximized) => {
    this.setState({ isPageMaximized });
  }

  closePageOptions = () => {
    this.setState({ isPageOptionsOpen: false });
  };

  togglePageOptions = () => {
    this.setState(prevState => ({
      isPageOptionsOpen: !prevState.isPageOptionsOpen,
    }));
  };

  togglePageMaximized = () => {
    this.closePageOptions();

    if (this.state.isPageMaximized) {
      minimizePageSize(PAGE_ID);
    } else {
      maximizePageSize(PAGE_ID);
    }
  };

  getHeaderSection() {
    return (
      <EuiPageContentHeaderSection data-test-subj="jobListPageHeader">
        <EuiTitle size="l">
          <h1>
            <FormattedMessage
              id="xpack.rollupJobs.jobListTitle"
              defaultMessage="Rollup jobs"
            />
          </h1>
        </EuiTitle>
      </EuiPageContentHeaderSection>
    );
  }

  renderNoPermission() {
    const { intl } = this.props;
    const title = intl.formatMessage({
      id: 'xpack.rollupJobs.jobList.noPermissionTitle',
      defaultMessage: 'Permission error',
    });
    return (
      <Fragment>
        {this.getHeaderSection()}
        <EuiSpacer size="m" />
        <EuiCallOut
          data-test-subj="jobListNoPermission"
          title={title}
          color="warning"
          iconType="help"
        >
          <FormattedMessage
            id="xpack.rollupJobs.jobList.noPermissionText"
            defaultMessage="You do not have permission to view or add rollup jobs."
          />
        </EuiCallOut>
      </Fragment>
    );
  }

  renderError(error) {
    // We can safely depend upon the shape of this error coming from Angular $http, because we
    // handle unexpected error shapes in the API action.
    const {
      statusCode,
      error: errorString,
    } = error.data;

    const { intl } = this.props;
    const title = intl.formatMessage({
      id: 'xpack.rollupJobs.jobList.loadingErrorTitle',
      defaultMessage: 'Error loading rollup jobs',
    });
    return (
      <Fragment>
        {this.getHeaderSection()}
        <EuiSpacer size="m" />
        <EuiCallOut
          data-test-subj="jobListError"
          title={title}
          color="danger"
          iconType="alert"
        >
          {statusCode} {errorString}
        </EuiCallOut>
      </Fragment>
    );
  }

  renderEmpty() {
    return (
      <EuiEmptyPrompt
        data-test-subj="jobListEmptyPrompt"
        iconType="indexRollupApp"
        title={(
          <h1>
            <FormattedMessage
              id="xpack.rollupJobs.jobList.emptyPromptTitle"
              defaultMessage="Create your first rollup job"
            />
          </h1>
        )}
        body={
          <Fragment>
            <p>
              <FormattedMessage
                id="xpack.rollupJobs.jobList.emptyPromptDescription"
                defaultMessage="Rollup jobs summarize and store historical data in a smaller index
                  for future analysis."
              />
            </p>
          </Fragment>
        }
        actions={
          <EuiButton
            data-test-subj="createRollupJobButton"
            {...getRouterLinkProps(`${CRUD_APP_BASE_PATH}/create`)}
            fill
            iconType="plusInCircle"
          >
            <FormattedMessage
              id="xpack.rollupJobs.jobList.emptyPrompt.createButtonLabel"
              defaultMessage="Create rollup job"
            />
          </EuiButton>
        }
      />
    );
  }

  renderLoading() {
    return (
      <EuiFlexGroup
        justifyContent="flexStart"
        alignItems="center"
        gutterSize="s"
      >
        <EuiFlexItem grow={false}>
          <EuiLoadingSpinner size="m" />
        </EuiFlexItem>

        <EuiFlexItem grow={false} data-test-subj="jobListLoading">
          <EuiText>
            <EuiTextColor color="subdued">
              <FormattedMessage
                id="xpack.rollupJobs.jobList.loadingTitle"
                defaultMessage="Loading rollup jobs..."
              />
            </EuiTextColor>
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  renderList() {
    const { isLoading } = this.props;
    const { isPageOptionsOpen, isPageMaximized } = this.state;

    return (
      <Fragment>
        <EuiPageContentHeader>
          {this.getHeaderSection()}

          <EuiPageContentHeaderSection>
            <EuiFlexGroup gutterSize="m" alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiButton fill {...getRouterLinkProps(`${CRUD_APP_BASE_PATH}/create`)}>
                  <FormattedMessage
                    id="xpack.rollupJobs.jobList.createButtonLabel"
                    defaultMessage="Create rollup job"
                  />
                </EuiButton>
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiPopover
                  id="pageOptionsMenu"
                  button={(
                    <EuiButtonIcon
                      onClick={this.togglePageOptions}
                      iconType="gear"
                      aria-label="Page options"
                    />
                  )}
                  isOpen={isPageOptionsOpen}
                  closePopover={this.closePageOptions}
                  panelPaddingSize="none"
                  anchorPosition="downLeft"
                >
                  <EuiContextMenu
                    initialPanelId={0}
                    panels={[{
                      id: 0,
                      items: [{
                        name: (isPageMaximized ? 'Minimize page' : 'Maximize page'),
                        icon: (
                          <EuiIcon
                            type="expand"
                            size="m"
                          />
                        ),
                        onClick: this.togglePageMaximized,
                      }]
                    }]}
                  />
                </EuiPopover>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPageContentHeaderSection>
        </EuiPageContentHeader>

        {isLoading ? this.renderLoading() : <JobTable />}

        <DetailPanel />
      </Fragment>
    );
  }

  render() {
    const { isLoading, hasJobs, jobLoadError } = this.props;

    let content;

    if (jobLoadError) {
      if (jobLoadError.status === 403) {
        content = this.renderNoPermission();
      } else {
        content = this.renderError(jobLoadError);
      }
    } else if (!isLoading && !hasJobs) {
      content = this.renderEmpty();
    } else {
      content = this.renderList();
    }

    return (
      <EuiPageContent
        horizontalPosition="center"
        className="rollupJobsListPanel"
      >
        {content}
      </EuiPageContent>
    );
  }
}

export const JobList = injectI18n(JobListUi);
