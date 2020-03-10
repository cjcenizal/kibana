/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import * as React from 'react';
import { mountWithIntl, nextTick } from 'test_utils/enzyme_helpers';
import { act } from 'react-dom/test-utils';
import { coreMock } from '../../../../../../../src/core/public/mocks';
import { actionTypeRegistryMock } from '../../action_type_registry.mock';
import { ValidationResult } from '../../../types';
import { AlertsContextProvider } from '../../context/alerts_context';
import { alertTypeRegistryMock } from '../../alert_type_registry.mock';
import { ReactWrapper } from 'enzyme';
import { AlertEdit } from './alert_edit';
const actionTypeRegistry = actionTypeRegistryMock.create();
const alertTypeRegistry = alertTypeRegistryMock.create();

describe('alert_edit', () => {
  let deps: any;
  let wrapper: ReactWrapper<any>;

  async function setup() {
    const mockes = coreMock.createSetup();
    deps = {
      toastNotifications: mockes.notifications.toasts,
      http: mockes.http,
      uiSettings: mockes.uiSettings,
      actionTypeRegistry: actionTypeRegistry as any,
      alertTypeRegistry: alertTypeRegistry as any,
    };
    const alertType = {
      id: 'my-alert-type',
      iconClass: 'test',
      name: 'test-alert',
      validate: (): ValidationResult => {
        return { errors: {} };
      },
      alertParamsExpression: () => <React.Fragment />,
    };

    const actionTypeModel = {
      id: 'my-action-type',
      iconClass: 'test',
      selectMessage: 'test',
      validateConnector: (): ValidationResult => {
        return { errors: {} };
      },
      validateParams: (): ValidationResult => {
        const validationResult = { errors: {} };
        return validationResult;
      },
      actionConnectorFields: null,
      actionParamsFields: null,
    };

    const alert = {
      id: 'ab5661e0-197e-45ee-b477-302d89193b5e',
      params: {
        aggType: 'average',
        threshold: [1000, 5000],
        index: 'kibana_sample_data_flights',
        timeField: 'timestamp',
        aggField: 'DistanceMiles',
        window: '1s',
        comparator: 'between',
      },
      consumer: 'alerting',
      alertTypeId: 'my-alert-type',
      enabled: false,
      schedule: { interval: '1m' },
      actions: [
        {
          actionTypeId: 'my-action-type',
          group: 'threshold met',
          params: { message: 'Alert [{{ctx.metadata.name}}] has exceeded the threshold' },
          message: 'Alert [{{ctx.metadata.name}}] has exceeded the threshold',
          id: '917f5d41-fbc4-4056-a8ad-ac592f7dcee2',
        },
      ],
      tags: [],
      name: 'test alert',
      throttle: null,
      apiKeyOwner: null,
      createdBy: 'elastic',
      updatedBy: 'elastic',
      createdAt: new Date(),
      muteAll: false,
      mutedInstanceIds: [],
      updatedAt: new Date(),
    };
    actionTypeRegistry.get.mockReturnValueOnce(actionTypeModel);
    actionTypeRegistry.has.mockReturnValue(true);
    alertTypeRegistry.list.mockReturnValue([alertType]);
    alertTypeRegistry.get.mockReturnValue(alertType);
    alertTypeRegistry.has.mockReturnValue(true);
    actionTypeRegistry.list.mockReturnValue([actionTypeModel]);
    actionTypeRegistry.has.mockReturnValue(true);

    wrapper = mountWithIntl(
      <AlertsContextProvider
        value={{
          reloadAlerts: () => {
            return new Promise<void>(() => {});
          },
          http: deps!.http,
          actionTypeRegistry: deps!.actionTypeRegistry,
          alertTypeRegistry: deps!.alertTypeRegistry,
          toastNotifications: deps!.toastNotifications,
          uiSettings: deps!.uiSettings,
        }}
      >
        <AlertEdit
          editFlyoutVisible={true}
          setEditFlyoutVisibility={() => {}}
          initialAlert={alert}
        />
      </AlertsContextProvider>
    );
    // Wait for active space to resolve before requesting the component to update
    await act(async () => {
      await nextTick();
      wrapper.update();
    });
  }

  it('renders alert add flyout', async () => {
    await setup();
    expect(wrapper.find('[data-test-subj="editAlertFlyoutTitle"]').exists()).toBeTruthy();
    expect(wrapper.find('[data-test-subj="saveEditedAlertButton"]').exists()).toBeTruthy();
  });
});
