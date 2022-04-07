import { mapValues } from 'lodash';
import settingsStore from './settings';
import globalStore from './global';
import logStore from './log';

const actionTypes = {
  LOAD_SETTINGS: 'loadSettings',
  SAVE_SETTINGS: 'saveSettings',
  PURGE_LOGS: 'purgeLogs',
  PURGE_ERROR_LOGS: 'purgeErrorLogs',
  FORCE_RESTART: 'forceRestart'
};

const withLoading = async (context, continuation) => {
  context.commit(globalStore.mutationTypes.ERROR, null, { root: true });
  context.commit(globalStore.mutationTypes.LOADING, true, { root: true });
  try {
    await continuation();
  } catch (error) {
    context.commit(globalStore.mutationTypes.ERROR, error.message, { root: true });
  } finally {
    context.commit(globalStore.mutationTypes.LOADING, false, { root: true });
  }
};
const withSaving = async (context, continuation) => {
  context.commit(globalStore.mutationTypes.SAVING, true, { root: true });
  await withLoading(context, continuation);
  context.commit(globalStore.mutationTypes.SAVING, false, { root: true });
};

const actions = {
  async [actionTypes.LOAD_SETTINGS](context) {
    return withLoading(context, async () => {
      await context.dispatch(settingsStore.actionTypes.LOAD_CONFIG, null, { root: true });
    });
  },
  async [actionTypes.SAVE_SETTINGS](context) {
    return withSaving(context, async () => {
      await context.dispatch(settingsStore.actionTypes.SAVE_CONFIG, null, { root: true });
    });
  },
  async [actionTypes.PURGE_LOGS](context) {
    return withLoading(context, async () => {
      await context.dispatch(logStore.actionTypes.PURGE_LOGS, null, { root: true });
    });
  },
  async [actionTypes.PURGE_ERROR_LOGS](context) {
    return withLoading(context, async () => {
      await context.dispatch(logStore.actionTypes.PURGE_ERROR_LOGS, null, { root: true });
    });
  },
  async [actionTypes.FORCE_RESTART](context) {
    return withLoading(context, async () => {
      await axios.post('/admin/plugins/express', 'ajax=restart', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    });
  }
};

export default {
  name: 'Actions',
  namespaced: true,
  actions,
  actionTypes: mapValues(actionTypes, (type) => `Actions/${type}`)
};
