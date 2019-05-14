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

export class IndexTemplateForm extends Component {
  constructor(...rest) {
    super(...rest);

    chrome.breadcrumbs.set([
      { text: 'Management', href: '#/management/elasticsearch' },
      { text: 'Index management', href: '#/management/elasticsearch/index_management' },
      { text: 'Create index template' },
    ]);

    this.options = [];

    this.state = {
      selectedOptions: [],
      settings: `{

}`,
      mappings: `{

}`,
      aliases: `{

}`,
    };
  }

  onChange = (selectedOptions) => {
    this.setState({
      selectedOptions,
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
      <EuiPageBody>
        <EuiPageContent>
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
                    Index patterns
                  </h2>
                </EuiTitle>
              )}
              description='Define which indices this template should apply to.'
              fullWidth
            >
              <EuiFormRow
                label="Index templates"
                fullWidth
              >
                <EuiComboBox
                  fullWidth
                  placeholder="Define index patterns"
                  options={this.options}
                  selectedOptions={selectedOptions}
                  onChange={this.onChange}
                  onCreateOption={this.onCreateOption}
                  isClearable={true}
                  data-test-subj="demoComboBox"
                />
              </EuiFormRow>
            </EuiDescribedFormGroup>

            <EuiDescribedFormGroup
              title={(
                <EuiTitle size="s">
                  <h2>
                    Settings
                  </h2>
                </EuiTitle>
              )}
              description={(
                <p>
                  Define how your indices behave. <EuiLink href="https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules.html" target="_blank">Learn more.</EuiLink>
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
                    Mappings
                  </h2>
                </EuiTitle>
              )}
              description={(
                <p>
                  Define how documents and their fields are stored and indexed. <EuiLink href="https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html" target="_blank">Learn more.</EuiLink>
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
                  value={mappings}
                  onChange={(json) => {
                    this.setState({
                      mappings: json,
                    })
                  }}
                />
              </EuiFormRow>
            </EuiDescribedFormGroup>

            <EuiDescribedFormGroup
              title={(
                <EuiTitle size="s">
                  <h2>
                    Aliases
                  </h2>
                </EuiTitle>
              )}
              description={(
                <p>
                  Use aliases to refer to the destination index by different names when making requests against Elasticsearch's APIs. <EuiLink href="https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-aliases.html" target="_blank">Learn more.</EuiLink>
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
                  value={aliases}
                  onChange={(json) => {
                    this.setState({
                      aliases: json,
                    })
                  }}
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
                href="#/management/elasticsearch/index_management/index_templates"
                fill
                data-test-subj="submitButton"
              >
                Create index template
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
        </EuiPageContent>
      </EuiPageBody>
    );
  }
}
