/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { Fragment, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { EuiPageBody, EuiPageContent, EuiText, EuiLink, EuiButtonEmpty, EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle, EuiFieldText, EuiForm, EuiDescribedFormGroup, EuiSelect, EuiFormRow } from '@elastic/eui';
import { Policy, EmptyPolicy } from '../../../../common/types';

import { CronEditor } from '../../components';
import { BASE_PATH, Section } from '../../constants';
import { useAppDependencies } from '../../index';
import { breadcrumbService } from '../../services/navigation';
import { addPolicy } from '../../services/http';

export const PolicyAdd: React.FunctionComponent<RouteComponentProps> = ({ history }) => {
  const {
    core: {
      i18n: { FormattedMessage },
    },
  } = useAppDependencies();

  // Set breadcrumb
  useEffect(() => {
    breadcrumbService.setBreadcrumbs('policyAdd');
  }, []);

  const emptyPolicy = {
    name: '',
    type: null,
    settings: {},
  };

  function renderCronEditor() {
    return (
      <Fragment>
        <CronEditor
          fieldToPreferredValueMap={{}}
          cronExpression="0 30 2 * * ?"
          frequency="YEAR"
          onChange={({
            cronExpression,
            frequency,
            fieldToPreferredValueMap,
          }) => {}}
        />

        <EuiText size="s">
          <EuiLink onClick={() => {}} data-test-subj="rollupShowAdvancedCronLink">
            <FormattedMessage
              id="xpack.rollupJobs.create.stepLogistics.sectionSchedule.buttonAdvancedLabel"
              defaultMessage="Create cron expression"
            />
          </EuiLink>
        </EuiText >
      </Fragment>
    );
  }

  return (
    <EuiPageBody>
      <EuiPageContent>
        <EuiTitle size="l">
          <h1>
            <FormattedMessage
              id="xpack.snapshotRestore.addPolicyTitle"
              defaultMessage="Create snapshot lifecycle policy"
            />
          </h1>
        </EuiTitle>
        <EuiSpacer size="l" />

        <EuiForm data-test-subj="followerIndexForm">
          <EuiDescribedFormGroup
            title={(
              <EuiTitle size="s">
                <h2>
                  Name
                </h2>
              </EuiTitle>
            )}
            description={(
              <FormattedMessage
                id="xpack.crossClusterReplication.followerIndexForm.sectionRemoteClusterDescription"
                defaultMessage="A unique name for your policy."
              />
            )}
            fullWidth
          >
            <EuiFormRow
              label="Name"
              helpText="Supports datemath, e.g. <my-snapshot-{now/d}>."
              fullWidth
            >
              <EuiFieldText
                fullWidth
              />
            </EuiFormRow>
          </EuiDescribedFormGroup>

          <EuiDescribedFormGroup
            title={(
              <EuiTitle size="s">
                <h2>
                  Repository
                </h2>
              </EuiTitle>
            )}
            description={(
              <FormattedMessage
                id="xpack.crossClusterReplication.followerIndexForm.sectionRemoteClusterDescription"
                defaultMessage="Where will snapshots be stored?"
              />
            )}
            fullWidth
          >
            <EuiFormRow
              label="Name"
              fullWidth
            >
              <EuiSelect
                fullWidth
                options={[
                  { value: 'option_one', text: 'clients_azure_repo' },
                  { value: 'option_two', text: 'experiments_s3_repo' },
                  { value: 'option_three', text: 'general_s3_repo' },
                ]}
              />
            </EuiFormRow>
          </EuiDescribedFormGroup>

          <EuiDescribedFormGroup
            title={(
              <EuiTitle size="s">
                <h2>
                  <FormattedMessage
                    id="xpack.rollupJobs.create.stepLogistics.sectionScheduleTitle"
                    defaultMessage="Schedule"
                  />
                </h2>
              </EuiTitle>
            )}
            description={(
              <FormattedMessage
                id="xpack.rollupJobs.create.stepLogistics.sectionScheduleDescription"
                defaultMessage="How often do you want to take a snapshot?"
              />
            )}
            fullWidth
          >
            {renderCronEditor()}
          </EuiDescribedFormGroup>
        </EuiForm>

        <EuiSpacer />

        <EuiFlexGroup gutterSize="m" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiButton
              color="secondary"
              iconType="check"
              onClick={() => {}}
              fill
              data-test-subj="submitButton"
            >
              Create policy
            </EuiButton>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              color="primary"
              onClick={() => {}}
              data-test-subj="cancelButton"
            >
              <FormattedMessage
                id="xpack.crossClusterReplication.followerIndexForm.cancelButtonLabel"
                defaultMessage="Cancel"
              />
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPageContent>
    </EuiPageBody>
  );
};
