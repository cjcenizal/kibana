/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { connect } from 'react-redux';
import {
  getDetailPanelIndexName,
  getPageOfIndices,
  getPager,
  getFilter,
  isDetailPanelOpen,
  showSystemIndices,
  getSortField,
  isSortAscending,
  getIndicesAsArray,
  indicesLoading,
  indicesError,
  getTableState,
} from '../../../../store/selectors';
import {
  filterChanged,
  closeDetailPanel,
  openDetailPanel,
  pageChanged,
  pageSizeChanged,
  sortChanged,
  showSystemIndicesChanged,
  loadIndices,
  reloadIndices,
  toggleChanged,
} from '../../../../store/actions';

import { IndexTable as PresentationComponent } from './index_table';

const mapStateToProps = state => {
  return {
    allIndices: getIndicesAsArray(state),
    isDetailPanelOpen: isDetailPanelOpen(state),
    detailPanelIndexName: getDetailPanelIndexName(state),
    indices: [
  {
    "health": "yellow",
    "status": "open",
    "name": "follow1",
    "uuid": "ijDW3tYYSxWZOVar2tjsrg",
    "primary": "1",
    "replica": "1",
    "documents": "0",
    'data_stream': 'production.logs',
    "size": "208b",
    "isFrozen": false,
    "aliases": "none",
    "isFollowerIndex": true,
    "ilm": {
      "index": "follow1",
      "managed": false
    },
    "isRollupIndex": false
  },
  {
    "health": "green",
    "status": "open",
    "name": "kibana_sample_data_flights",
    "uuid": "Kg7SIgRoTzOpC5VI_8tQog",
    "primary": "1",
    "replica": "0",
    "documents": "13059",
    "size": "6.4mb",
    "isFrozen": false,
    "aliases": "none",
    "isFollowerIndex": false,
    "ilm": {
      "index": "kibana_sample_data_flights",
      "managed": true,
      "policy": "ilm-history-ilm-policy",
      "lifecycle_date_millis": 1588200894255,
      "age": "4.94d",
      "phase": "hot",
      "phase_time_millis": 1588626941979,
      "action": "rollover",
      "action_time_millis": 1588625742193,
      "step": "ERROR",
      "step_time_millis": 1588627541973,
      "failed_step": "check-rollover-ready",
      "is_auto_retryable_error": true,
      "failed_step_retry_count": 1,
      "step_info": {
        "type": "illegal_argument_exception",
        "reason": "setting [index.lifecycle.rollover_alias] for index [kibana_sample_data_flights] is empty or not defined",
        "stack_trace": "java.lang.IllegalArgumentException: setting [index.lifecycle.rollover_alias] for index [kibana_sample_data_flights] is empty or not defined\n\tat org.elasticsearch.xpack.core.ilm.WaitForRolloverReadyStep.evaluateCondition(WaitForRolloverReadyStep.java:55)\n\tat org.elasticsearch.xpack.ilm.IndexLifecycleRunner.runPeriodicStep(IndexLifecycleRunner.java:173)\n\tat org.elasticsearch.xpack.ilm.IndexLifecycleService.triggerPolicies(IndexLifecycleService.java:329)\n\tat org.elasticsearch.xpack.ilm.IndexLifecycleService.triggered(IndexLifecycleService.java:267)\n\tat org.elasticsearch.xpack.core.scheduler.SchedulerEngine.notifyListeners(SchedulerEngine.java:183)\n\tat org.elasticsearch.xpack.core.scheduler.SchedulerEngine$ActiveSchedule.run(SchedulerEngine.java:211)\n\tat java.base/java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:515)\n\tat java.base/java.util.concurrent.FutureTask.run(FutureTask.java:264)\n\tat java.base/java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:304)\n\tat java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1128)\n\tat java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628)\n\tat java.base/java.lang.Thread.run(Thread.java:835)\n"
      },
      "phase_execution": {
        "policy": "ilm-history-ilm-policy",
        "phase_definition": {
          "min_age": "0ms",
          "actions": {
            "rollover": {
              "max_size": "50gb",
              "max_age": "30d"
            }
          }
        },
        "version": 1,
        "modified_date_in_millis": 1588111974219
      }
    },
    "isRollupIndex": false
  },
  {
    "health": "green",
    "status": "open",
    "name": "kibana_sample_data_ecommerce",
    "uuid": "gMXhK63RRR6Ezcuccp4hQQ",
    "primary": "1",
    "replica": "0",
    "documents": "4675",
    "size": "4.7mb",
    "isFrozen": false,
    "aliases": "none",
    "isFollowerIndex": false,
    "ilm": {
      "index": "kibana_sample_data_ecommerce",
      "managed": false
    },
    "isRollupIndex": false
  },
  {
    "health": "green",
    "status": "open",
    "name": "kibana_sample_data_logs",
    "uuid": "xepwZf38SO-uWCOZJKCpPw",
    "primary": "1",
    "replica": "0",
    "documents": "14074",
    "size": "11.6mb",
    "isFrozen": false,
    "aliases": "none",
    "isFollowerIndex": false,
    "ilm": {
      "index": "kibana_sample_data_logs",
      "managed": false
    },
    "isRollupIndex": false
  }
],
    pager: getPager(state),
    filter: getFilter(state),
    showSystemIndices: showSystemIndices(state),
    sortField: getSortField(state),
    isSortAscending: isSortAscending(state),
    indicesLoading: indicesLoading(state),
    indicesError: indicesError(state),
    toggleNameToVisibleMap: getTableState(state).toggleNameToVisibleMap,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    filterChanged: filter => {
      dispatch(filterChanged({ filter }));
    },
    pageChanged: pageNumber => {
      dispatch(pageChanged({ pageNumber }));
    },
    pageSizeChanged: pageSize => {
      dispatch(pageSizeChanged({ pageSize }));
    },
    sortChanged: (sortField, isSortAscending) => {
      dispatch(sortChanged({ sortField, isSortAscending }));
    },
    showSystemIndicesChanged: showSystemIndices => {
      dispatch(showSystemIndicesChanged({ showSystemIndices }));
    },
    toggleChanged: (toggleName, toggleValue) => {
      dispatch(toggleChanged({ toggleName, toggleValue }));
    },
    openDetailPanel: indexName => {
      dispatch(openDetailPanel({ indexName }));
    },
    closeDetailPanel: () => {
      dispatch(closeDetailPanel());
    },
    loadIndices: () => {
      dispatch(loadIndices());
    },
    reloadIndices: () => {
      dispatch(reloadIndices());
    },
  };
};

export const IndexTable = connect(mapStateToProps, mapDispatchToProps)(PresentationComponent);
