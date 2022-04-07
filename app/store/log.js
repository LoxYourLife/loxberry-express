import { mapValues, isNil } from 'lodash';
import axios from 'axios';

const actionTypes = {
  PURGE_LOGS: 'purgeLogs',
  PURGE_ERROR_LOGS: 'purgeErrorLogs'
};
const mutationTypes = {
  ADD_LOG: 'addLog',
  PURGE_LOG: 'purgeLog',
  ADD_ERROR_LOG: 'addErrorLog',
  PURGE_ERROR_LOG: 'purgeErrorLog'
};

const state = () => ({
  logs: [],
  errorLogs: []
});

const actions = {
  async [actionTypes.PURGE_LOGS](context) {
    await axios.delete('/admin/express/system/log', { validateStatus: (status) => status < 500 });
    context.commit(mutationTypes.PURGE_LOG);
  },
  async [actionTypes.PURGE_ERROR_LOGS](context) {
    await axios.delete('/admin/express/system/error-log', { validateStatus: (status) => status < 500 });
    context.commit(mutationTypes.PURGE_ERROR_LOG);
  }
};
const mutations = {
  [mutationTypes.ADD_LOG](state, logEntries) {
    state.logs.push(...logEntries);
  },
  [mutationTypes.PURGE_LOG](state) {
    state.logs = [];
  },
  [mutationTypes.ADD_ERROR_LOG](state, logEntries) {
    state.errorLogs.push(...logEntries);
  },
  [mutationTypes.PURGE_ERROR_LOG](state) {
    state.errorLogs = [];
  }
};

const getters = {};

export default {
  name: 'Log',
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  mutationTypes: mapValues(mutationTypes, (type) => `Log/${type}`),
  actionTypes: mapValues(actionTypes, (type) => `Log/${type}`)
};
