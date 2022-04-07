import { mapValues } from 'lodash';

const actionTypes = {};
const mutationTypes = {
  ERROR: 'error',
  RESET_ERROR: 'resetError',
  LOADING: 'setLoading',
  SAVING: 'setSaving'
};

const state = () => ({
  isLoading: false,
  isSaving: false,
  error: null
});

const actions = {};
const mutations = {
  [mutationTypes.LOADING](state, isLoading) {
    state.isLoading = isLoading;
  },
  [mutationTypes.SAVING](state, isSaving) {
    state.isSaving = isSaving;
  },
  [mutationTypes.ERROR](state, error) {
    state.error = error;
  },
  [mutationTypes.RESET_ERROR](state) {
    state.error = null;
  }
};

export default {
  name: 'Global',
  namespaced: true,
  state,
  actions,
  mutations,
  mutationTypes: mapValues(mutationTypes, (type) => `Global/${type}`),
  actionTypes: mapValues(actionTypes, (type) => `Global/${type}`)
};
