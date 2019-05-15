/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useState, Fragment, Component } from 'react';
import { i18n } from '@kbn/i18n';
import { Route } from 'react-router-dom';

import chrome from 'ui/chrome';
import { EuiPageBody, EuiComboBox, EuiCodeEditor, EuiPageContent, EuiText, EuiLink, EuiButtonEmpty, EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle, EuiFieldText, EuiForm, EuiDescribedFormGroup, EuiSelect, EuiFormRow } from '@elastic/eui';

export class ReindexWizard extends Component {
  constructor(...rest) {
    super(...rest);

    chrome.breadcrumbs.set([
      { text: 'Management', href: '#/management/elasticsearch' },
      { text: 'Index management', href: '#/management/elasticsearch/index_management' },
      { text: 'Reindex indices' },
    ]);

    this.selectOptions = [
      { value: 'internal', text: 'Internal' },
      { value: 'external', text: 'External' },
    ];

    this.options = [{
      label: 'kibana_sample_data_flights',
    }, {
      label: 'kibana_sample_data_logs',
    }, {
      label: 'kibana_sample_data_ecommerce',
    }, {
      label: 'web-logs-1',
    }, {
      label: 'web-logs-2',
    }, {
      label: 'web-logs-3',
    }, {
      label: 'client-access',
    }, {
      label: 'sales-metrics-2019',
    }];

    this.state = {
      value: this.selectOptions[0].value,
      selectedOptions: [this.options[0], this.options[1], this.options[2]],
      settings: '',
    };
  }

  onChange = (selectedOptions) => {
    this.setState({
      selectedOptions,
    });
  };

  onSelectChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  onCreateOption = (searchValue, flattenedOptions) => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();

    if (!normalizedSearchValue) {
      return;
    }

    const newOption = {
      label: searchValue,
    };

    // Create the option if it doesn't exist.
    if (flattenedOptions.findIndex(option =>
      option.label.trim().toLowerCase() === normalizedSearchValue
    ) === -1) {
      this.options.push(newOption);
    }

    // Select the option.
    this.setState(prevState => ({
      selectedOptions: prevState.selectedOptions.concat(newOption),
    }));
  };

  render() {
    const { selectedOptions, settings, mappings, aliases } = this.state;

    return (
        <Fragment>
          <EuiTitle size="l">
            <h1>
              Reindex indices
            </h1>
          </EuiTitle>
          <EuiSpacer size="l" />

          <EuiForm data-test-subj="followerIndexForm">
            <EuiDescribedFormGroup
              title={(
                <EuiTitle size="s">
                  <h2>
                    Logistics
                  </h2>
                </EuiTitle>
              )}
              description='Which data do you want to reindex, and where should we create the new data?'
              fullWidth
            >
              <EuiFormRow
                label="Source indices"
                fullWidth
              >
                <EuiComboBox
                  fullWidth
                  placeholder="Select indices or define index patterns"
                  options={this.options}
                  selectedOptions={selectedOptions}
                  onChange={this.onChange}
                  onCreateOption={this.onCreateOption}
                  isClearable={true}
                  data-test-subj="demoComboBox"
                />
              </EuiFormRow>

              <EuiFormRow
                label="Destination index"
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
                    Painless script
                  </h2>
                </EuiTitle>
              )}
              description={(
                <p>
                  Modify the metadata of each document. <EuiLink href="https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-reindex.html" target="_blank">Learn more.</EuiLink>
                </p>
              )}
              fullWidth
            >
              <EuiFormRow
                label="Name"
                fullWidth
              >
                <EuiCodeEditor
                  fullWidth
                  mode="json"
                  width="100%"
                  theme="github"
                  value={settings}
                  onChange={(json) => {
                    this.setState({
                      settings: json,
                    })
                  }}
                />
              </EuiFormRow>
            </EuiDescribedFormGroup>

            <EuiDescribedFormGroup
              title={(
                <EuiTitle size="s">
                  <h2>
                    Version type
                  </h2>
                </EuiTitle>
              )}
              description={(
                <p>
                  How would you like to resolve version conflicts? <EuiLink href="https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-reindex.html" target="_blank">Learn more.</EuiLink>
                </p>
              )}
              fullWidth
            >
              <EuiFormRow
                label="Name"
                fullWidth
              >
                <EuiSelect
                  options={this.selectOptions}
                  value={this.state.value}
                  onChange={this.onSelectChange}
                />
              </EuiFormRow>
            </EuiDescribedFormGroup>
          </EuiForm>

          <EuiSpacer />

          <EuiFlexGroup gutterSize="m" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButton
                color="secondary"
                iconType="check"
                href="#/management/elasticsearch/index_management/reindex_tasks"
                fill
                data-test-subj="submitButton"
              >
                Start reindexing
              </EuiButton>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                color="primary"
                onClick={() => {}}
                data-test-subj="cancelButton"
              >
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Fragment>
    );
  }
}
