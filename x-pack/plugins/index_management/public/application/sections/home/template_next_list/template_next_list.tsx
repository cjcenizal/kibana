/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { FormattedMessage } from '@kbn/i18n/react';
import {
  EuiEmptyPrompt,
  EuiSpacer,
  EuiTitle,
  EuiText,
  EuiSwitch,
  EuiFlexItem,
  EuiFlexGroup,
} from '@elastic/eui';

import { UIM_TEMPLATE_LIST_LOAD } from '../../../../../common/constants';
import { IndexTemplateFormatVersion } from '../../../../../common';
import { SectionError, SectionLoading, Error } from '../../../components';
import { useLoadIndexTemplates } from '../../../services/api';
import { useServices } from '../../../app_context';
import {
  getTemplateEditLink,
  getTemplateListLink,
  getTemplateCloneLink,
} from '../../../services/routing';
import { getFormatVersionFromQueryparams } from '../../../lib/index_templates';
import { TemplateTable } from './template_table';
import { TemplateDetails } from './template_details';

interface MatchParams {
  templateName?: string;
}

export const TemplateNextList: React.FunctionComponent<RouteComponentProps<MatchParams>> = ({
  match: {
    params: { templateName },
  },
  location,
  history,
}) => {
  const { uiMetricService } = useServices();
  // const { error, isLoading, data: templates, sendRequest: reload } = useLoadIndexTemplates();
  const error = null;
  const isLoading = false;
  const reload = () => {};
  const templates = [{
    "name": "triggered_watches",
    "version": 11,
    "order": 2147483647,
    "indexPatterns": [
      ".triggered_watches*"
    ],
    "isManaged": false,
    "_kbnMeta": {
      "formatVersion": 2
    },
    "hasSettings": true,
    "hasAliases": false,
    "hasMappings": true,
    "components": 0
  },
  {
    "name": "ilm-history",
    "version": 2,
    "order": 2147483647,
    "indexPatterns": [
      "ilm-history-2*"
    ],
    "ilmPolicy": {
      "name": "ilm-history-ilm-policy",
      "rollover_alias": "ilm-history-2"
    },
    "isManaged": false,
    "_kbnMeta": {
      "formatVersion": 2
    },
    "hasSettings": false,
    "hasAliases": false,
    "hasMappings": false,
    "components": 4,
  },
  {
    "name": "monitoring-es",
    "version": 7000099,
    "order": 0,
    "indexPatterns": [
      ".monitoring-es-7-*"
    ],
    "isManaged": false,
    "_kbnMeta": {
      "formatVersion": 2
    },
    "hasSettings": false,
    "hasAliases": false,
    "hasMappings": false,
    "components": 3,
  },
  {
    "name": "watches",
    "version": 11,
    "order": 2147483647,
    "indexPatterns": [
      ".watches*"
    ],
    "isManaged": false,
    "_kbnMeta": {
      "formatVersion": 1
    },
    "hasSettings": true,
    "hasAliases": false,
    "hasMappings": true,
    "components": 0
  },
  {
    "name": "ml-meta",
    "version": 8000099,
    "order": 0,
    "indexPatterns": [
      ".ml-meta"
    ],
    "isManaged": false,
    "_kbnMeta": {
      "formatVersion": 1
    },
    "hasSettings": true,
    "hasAliases": false,
    "hasMappings": true,
    "components": 0
  },
  {
    "name": ".ml-config",
    "version": 8000099,
    "order": 0,
    "indexPatterns": [
      ".ml-config"
    ],
    "isManaged": false,
    "_kbnMeta": {
      "formatVersion": 1
    },
    "hasSettings": true,
    "hasAliases": false,
    "hasMappings": true,
    "components": 0
  }];
  const queryParamsFormatVersion = getFormatVersionFromQueryparams(location);

  let content;

  const [showSystemTemplates, setShowSystemTemplates] = useState<boolean>(false);

  // Filter out system index templates
  const filteredTemplates = useMemo(
    () => (templates ? templates.filter(template => !template.name.startsWith('.')) : []),
    [templates]
  );

  const closeTemplateDetails = () => {
    history.push(getTemplateListLink());
  };

  const editTemplate = (name: string, formatVersion: IndexTemplateFormatVersion) => {
    history.push(getTemplateEditLink(name, formatVersion));
  };

  const cloneTemplate = (name: string, formatVersion: IndexTemplateFormatVersion) => {
    history.push(getTemplateCloneLink(name, formatVersion));
  };

  // Track component loaded
  useEffect(() => {
    uiMetricService.trackMetric('loaded', UIM_TEMPLATE_LIST_LOAD);
  }, [uiMetricService]);

  if (isLoading) {
    content = (
      <SectionLoading>
        <FormattedMessage
          id="xpack.idxMgmt.indexTemplatesList.loadingIndexTemplatesDescription"
          defaultMessage="Loading templates…"
        />
      </SectionLoading>
    );
  } else if (error) {
    content = (
      <SectionError
        title={
          <FormattedMessage
            id="xpack.idxMgmt.indexTemplatesList.loadingIndexTemplatesErrorMessage"
            defaultMessage="Error loading templates"
          />
        }
        error={error as Error}
      />
    );
  } else if (Array.isArray(templates) && templates.length === 0) {
    content = (
      <EuiEmptyPrompt
        iconType="managementApp"
        title={
          <h1 data-test-subj="title">
            <FormattedMessage
              id="xpack.idxMgmt.indexTemplatesList.emptyPrompt.noIndexTemplatesTitle"
              defaultMessage="You don't have any templates yet"
            />
          </h1>
        }
        data-test-subj="emptyPrompt"
      />
    );
  } else if (Array.isArray(templates) && templates.length > 0) {
    content = (
      <Fragment>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={true}>
            <EuiTitle size="s">
              <EuiText color="subdued">
                <FormattedMessage
                  id="xpack.idxMgmt.home.indexTemplatesDescription"
                  defaultMessage="Build index templates out of composable component templates."
                />
              </EuiText>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSwitch
              id="checkboxShowSystemIndexTemplates"
              data-test-subj="systemTemplatesSwitch"
              checked={showSystemTemplates}
              onChange={event => setShowSystemTemplates(event.target.checked)}
              label={
                <FormattedMessage
                  id="xpack.idxMgmt.indexTemplatesTable.systemIndexTemplatesSwitchLabel"
                  defaultMessage="Include system templates"
                />
              }
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="l" />
        <TemplateTable
          templates={showSystemTemplates ? templates : filteredTemplates}
          reload={reload}
          editTemplate={editTemplate}
          cloneTemplate={cloneTemplate}
        />
      </Fragment>
    );
  }

  return (
    <div data-test-subj="templateList">
      {content}
      {templateName && queryParamsFormatVersion !== undefined && (
        <TemplateDetails
          template={{
            name: templateName,
            formatVersion: queryParamsFormatVersion,
          }}
          onClose={closeTemplateDetails}
          editTemplate={editTemplate}
          cloneTemplate={cloneTemplate}
          reload={reload}
        />
      )}
    </div>
  );
};
