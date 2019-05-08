/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { padLeft } from 'lodash';
import { FormattedMessage } from '@kbn/i18n/react';

import {
  EuiSelect,
  EuiText,
  EuiFormRow,
} from '@elastic/eui';

import { i18n } from '@kbn/i18n';

// The international ISO standard dictates Monday as the first day of the week, but cron patterns
// use Sunday as the first day, so we're going with the cron way.
const dayOrdinalToDayNameMap = {
  0: i18n.translate('xpack.rollupJobs.util.day.sunday', { defaultMessage: 'Sunday' }),
  1: i18n.translate('xpack.rollupJobs.util.day.monday', { defaultMessage: 'Monday' }),
  2: i18n.translate('xpack.rollupJobs.util.day.tuesday', { defaultMessage: 'Tuesday' }),
  3: i18n.translate('xpack.rollupJobs.util.day.wednesday', { defaultMessage: 'Wednesday' }),
  4: i18n.translate('xpack.rollupJobs.util.day.thursday', { defaultMessage: 'Thursday' }),
  5: i18n.translate('xpack.rollupJobs.util.day.friday', { defaultMessage: 'Friday' }),
  6: i18n.translate('xpack.rollupJobs.util.day.saturday', { defaultMessage: 'Saturday' }),
};

const monthOrdinalToMonthNameMap = {
  0: i18n.translate('xpack.rollupJobs.util.month.january', { defaultMessage: 'January' }),
  1: i18n.translate('xpack.rollupJobs.util.month.february', { defaultMessage: 'February' }),
  2: i18n.translate('xpack.rollupJobs.util.month.march', { defaultMessage: 'March' }),
  3: i18n.translate('xpack.rollupJobs.util.month.april', { defaultMessage: 'April' }),
  4: i18n.translate('xpack.rollupJobs.util.month.may', { defaultMessage: 'May' }),
  5: i18n.translate('xpack.rollupJobs.util.month.june', { defaultMessage: 'June' }),
  6: i18n.translate('xpack.rollupJobs.util.month.july', { defaultMessage: 'July' }),
  7: i18n.translate('xpack.rollupJobs.util.month.august', { defaultMessage: 'August' }),
  8: i18n.translate('xpack.rollupJobs.util.month.september', { defaultMessage: 'September' }),
  9: i18n.translate('xpack.rollupJobs.util.month.october', { defaultMessage: 'October' }),
  10: i18n.translate('xpack.rollupJobs.util.month.november', { defaultMessage: 'November' }),
  11: i18n.translate('xpack.rollupJobs.util.month.december', { defaultMessage: 'December' }),
};

export function getOrdinalValue(number) {
  // TODO: This is breaking reporting pdf generation. Possibly due to phantom not setting locale,
  // which is needed by i18n (formatjs). Need to verify, fix, and restore i18n in place of static stings.
  // return i18n.translate('xpack.rollupJobs.util.number.ordinal', {
  //   defaultMessage: '{number, selectordinal, one{#st} two{#nd} few{#rd} other{#th}}',
  //   values: { number },
  // });
  // TODO: https://github.com/elastic/kibana/issues/27136

  // Protects against falsey (including 0) values
  const num = number && number.toString();
  let lastDigit = num && num.substr(-1);
  let ordinal;

  if(!lastDigit) {
    return number;
  }
  lastDigit = parseFloat(lastDigit);

  switch(lastDigit) {
    case 1:
      ordinal = 'st';
      break;
    case 2:
      ordinal = 'nd';
      break;
    case 3:
      ordinal = 'rd';
      break;
    default:
      ordinal = 'th';
  }

  return `${num}${ordinal}`;
}

export function getDayName(dayOrdinal) {
  return dayOrdinalToDayNameMap[dayOrdinal];
}

export function getMonthName(monthOrdinal) {
  return monthOrdinalToMonthNameMap[monthOrdinal];
}

import { CronHourly } from './cron_hourly';
import { CronDaily } from './cron_daily';
import { CronWeekly } from './cron_weekly';
import { CronMonthly } from './cron_monthly';
import { CronYearly } from './cron_yearly';

export const MINUTE = 'MINUTE';
export const HOUR = 'HOUR';
export const DAY = 'DAY';
export const WEEK = 'WEEK';
export const MONTH = 'MONTH';
export const YEAR = 'YEAR';

export function cronExpressionToParts(expression) {
  const parsedCron = {
    second: undefined,
    minute: undefined,
    hour: undefined,
    day: undefined,
    date: undefined,
    month: undefined,
  };

  const parts = expression.split(' ');

  if (parts.length >= 1) {
    parsedCron.second = parts[0];
  }

  if (parts.length >= 2) {
    parsedCron.minute = parts[1];
  }

  if (parts.length >= 3) {
    parsedCron.hour = parts[2];
  }

  if (parts.length >= 4) {
    parsedCron.date = parts[3];
  }

  if (parts.length >= 5) {
    parsedCron.month = parts[4];
  }

  if (parts.length >= 6) {
    parsedCron.day = parts[5];
  }

  return parsedCron;
}

export function cronPartsToExpression({
  second,
  minute,
  hour,
  day,
  date,
  month,
}) {
  return `${second} ${minute} ${hour} ${date} ${month} ${day}`;
}


function makeSequence(min, max) {
  const values = [];
  for (let i = min; i <= max; i++) {
    values.push(i);
  }
  return values;
}

const MINUTE_OPTIONS = makeSequence(0, 59).map(value => ({
  value: value.toString(),
  text: padLeft(value, 2, '0'),
}));

const HOUR_OPTIONS = makeSequence(0, 23).map(value => ({
  value: value.toString(),
  text: padLeft(value, 2, '0'),
}));

const DAY_OPTIONS = makeSequence(1, 7).map(value => ({
  value: value.toString(),
  text: getDayName(value - 1),
}));

const DATE_OPTIONS = makeSequence(1, 31).map(value => ({
  value: value.toString(),
  text: getOrdinalValue(value),
}));

const MONTH_OPTIONS = makeSequence(1, 12).map(value => ({
  value: value.toString(),
  text: getMonthName(value - 1),
}));

const UNITS = [{
  value: MINUTE,
  text: 'minute',
}, {
  value: HOUR,
  text: 'hour',
}, {
  value: DAY,
  text: 'day',
}, {
  value: WEEK,
  text: 'week',
}, {
  value: MONTH,
  text: 'month',
}, {
  value: YEAR,
  text: 'year',
}];

const frequencyToFieldsMap = {
  [MINUTE]: {},
  [HOUR]: {
    minute: true,
  },
  [DAY]: {
    hour: true,
    minute: true,
  },
  [WEEK]: {
    day: true,
    hour: true,
    minute: true,
  },
  [MONTH]: {
    date: true,
    hour: true,
    minute: true,
  },
  [YEAR]: {
    month: true,
    date: true,
    hour: true,
    minute: true,
  },
};

const frequencyToBaselineFieldsMap = {
  [MINUTE]: {
    second: '0',
    minute: '*',
    hour: '*',
    date: '*',
    month: '*',
    day: '?',
  },
  [HOUR]: {
    second: '0',
    minute: '0',
    hour: '*',
    date: '*',
    month: '*',
    day: '?',
  },
  [DAY]: {
    second: '0',
    minute: '0',
    hour: '0',
    date: '*',
    month: '*',
    day: '?',
  },
  [WEEK]: {
    second: '0',
    minute: '0',
    hour: '0',
    date: '?',
    month: '*',
    day: '7',
  },
  [MONTH]: {
    second: '0',
    minute: '0',
    hour: '0',
    date: '1',
    month: '*',
    day: '?',
  },
  [YEAR]: {
    second: '0',
    minute: '0',
    hour: '0',
    date: '1',
    month: '1',
    day: '?',
  },
};

export class CronEditor extends Component {
  static propTypes = {
    fieldToPreferredValueMap: PropTypes.object.isRequired,
    frequency: PropTypes.string.isRequired,
    cronExpression: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  static getDerivedStateFromProps(props) {
    const { cronExpression } = props;
    return cronExpressionToParts(cronExpression);
  }

  constructor(props) {
    super(props);

    const { cronExpression } = props;

    const parsedCron = cronExpressionToParts(cronExpression);

    this.state = {
      ...parsedCron,
    };
  }

  onChangeFrequency = frequency => {
    const { onChange, fieldToPreferredValueMap } = this.props;

    // Update fields which aren't editable with acceptable baseline values.
    const editableFields = Object.keys(frequencyToFieldsMap[frequency]);
    const inheritedFields = editableFields.reduce((baselineFields, field) => {
      if (fieldToPreferredValueMap[field] != null) {
        baselineFields[field] = fieldToPreferredValueMap[field];
      }
      return baselineFields;
    }, { ...frequencyToBaselineFieldsMap[frequency] });

    const newCronExpression = cronPartsToExpression(inheritedFields);

    onChange({
      frequency,
      cronExpression: newCronExpression,
      fieldToPreferredValueMap,
    });
  };

  onChangeFields = fields => {
    const { onChange, frequency, fieldToPreferredValueMap } = this.props;

    const editableFields = Object.keys(frequencyToFieldsMap[frequency]);
    const newFieldToPreferredValueMap = {};

    const editedFields = editableFields.reduce((accumFields, field) => {
      if (fields[field] !== undefined) {
        accumFields[field] = fields[field];
        // Once the user touches a field, we want to persist its value as the user changes
        // the cron frequency.
        newFieldToPreferredValueMap[field] = fields[field];
      } else {
        accumFields[field] = this.state[field];
      }
      return accumFields;
    }, { ...frequencyToBaselineFieldsMap[frequency] });

    const newCronExpression = cronPartsToExpression(editedFields);

    onChange({
      frequency,
      cronExpression: newCronExpression,
      fieldToPreferredValueMap: {
        ...fieldToPreferredValueMap,
        ...newFieldToPreferredValueMap,
      }
    });
  };

  renderForm() {
    const { frequency } = this.props;

    const {
      minute,
      hour,
      day,
      date,
      month,
    } = this.state;

    switch (frequency) {
      case MINUTE:
        return;

      case HOUR:
        return (
          <CronHourly
            minute={minute}
            minuteOptions={MINUTE_OPTIONS}
            onChange={this.onChangeFields}
          />
        );

      case DAY:
        return (
          <CronDaily
            minute={minute}
            minuteOptions={MINUTE_OPTIONS}
            hour={hour}
            hourOptions={HOUR_OPTIONS}
            onChange={this.onChangeFields}
          />
        );

      case WEEK:
        return (
          <CronWeekly
            minute={minute}
            minuteOptions={MINUTE_OPTIONS}
            hour={hour}
            hourOptions={HOUR_OPTIONS}
            day={day}
            dayOptions={DAY_OPTIONS}
            onChange={this.onChangeFields}
          />
        );

      case MONTH:
        return (
          <CronMonthly
            minute={minute}
            minuteOptions={MINUTE_OPTIONS}
            hour={hour}
            hourOptions={HOUR_OPTIONS}
            date={date}
            dateOptions={DATE_OPTIONS}
            onChange={this.onChangeFields}
          />
        );

      case YEAR:
        return (
          <CronYearly
            minute={minute}
            minuteOptions={MINUTE_OPTIONS}
            hour={hour}
            hourOptions={HOUR_OPTIONS}
            date={date}
            dateOptions={DATE_OPTIONS}
            month={month}
            monthOptions={MONTH_OPTIONS}
            onChange={this.onChangeFields}
          />
        );

      default:
        return;
    }
  }

  render() {
    const { frequency } = this.props;

    return (
      <Fragment>
        <EuiFormRow
          label={(
            <FormattedMessage
              id="xpack.rollupJobs.cronEditor.fieldFrequencyLabel"
              defaultMessage="Frequency"
            />
          )}
          fullWidth
        >
          <EuiSelect
            options={UNITS}
            value={frequency}
            onChange={e => this.onChangeFrequency(e.target.value)}
            fullWidth
            prepend={(
              <EuiText size="xs">
                <strong>
                  <FormattedMessage
                    id="xpack.rollupJobs.cronEditor.textEveryLabel"
                    defaultMessage="Every"
                  />
                </strong>
              </EuiText>
            )}
            data-test-subj="rollupJobCreateFrequencySelect"
          />
        </EuiFormRow>

        {this.renderForm()}
      </Fragment>
    );
  }
}
