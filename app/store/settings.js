import axios from 'axios';
import { mapValues } from 'lodash';

const actionTypes = {
  LOAD_CONFIG: 'loadConfig',
  SAVE_CONFIG: 'saveConfig'
};
const mutationTypes = {
  STORE_CONFIG: 'storeConfig'
};

const state = () => ({
  config: {
    expressPort: null,
    managerPort: null,
    loglevel: {
      info: false,
      debug: false,
      warn: false,
      error: false
    }
  }
});

const actions = {
  async [actionTypes.LOAD_CONFIG](context) {
    try {
      const response = await axios.get('/admin/express/system/config', { timeout: 1000 });
      context.commit(mutationTypes.STORE_CONFIG, response.data);
    } catch {
      throw Error('Cannot load configuration. Try to restart the Server and reload the page.');
    }
  },
  async [actionTypes.SAVE_CONFIG](context) {
    try {
      await axios.post('/admin/express/system/config', context.state.config);
    } catch {
      throw Error('Cannot save config. Please check the logs for further guidance.');
    }
  }
};
const mutations = {
  [mutationTypes.STORE_CONFIG](state, config) {
    state.config = config;
  }
};

export default {
  name: 'Settings',
  namespaced: true,
  state,
  actions,
  mutations,
  mutationTypes: mapValues(mutationTypes, (type) => `Settings/${type}`),
  actionTypes: mapValues(actionTypes, (type) => `Settings/${type}`)
};
