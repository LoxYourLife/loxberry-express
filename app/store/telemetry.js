import { mapValues, isNil } from 'lodash';

const actionTypes = {};
const mutationTypes = {
  SET_TELEMETRY: 'settelemetry',
  SET_STATUS: 'setStatus'
};

const state = () => ({
  telemetry: {
    name: null,
    pid: null,
    status: 'unknown',
    version: null,
    memory: { value: 0, unit: null },
    cpu: 0,
    uptime: null,
    HeapSize: { value: null, unit: null },
    HeapUsage: { value: null, unit: null },
    UsedHeapSize: { value: null, unit: null },
    ActiveRequests: 0,
    ActiveHandles: 4,
    EventLoopLatency: { value: null, unit: null }
  },
  isOnline: false
});

const actions = {};
const mutations = {
  [mutationTypes.SET_TELEMETRY](state, telemetry) {
    state.telemetry = telemetry;
  },
  [mutationTypes.SET_STATUS](state, status) {
    state.telemetry.status = status;
  }
};

const getters = {
  isOnline(state) {
    if (isNil(state.telemetry.pid)) return false;
    return state.telemetry.status === 'online';
  },
  disabled(state) {
    const restartAndDone = state.telemetry.status.startsWith('restarting');
    const startAndDone = state.telemetry.status.startsWith('starting');
    const stopAndDone = state.telemetry.status.startsWith('stopping');
    if (restartAndDone || startAndDone || stopAndDone) {
      return true;
    }
    return false;
  },
  metadata(state) {
    return [
      { name: 'Name', telemetry: state.telemetry.name },
      { name: 'Version', telemetry: state.telemetry.version },
      { name: 'Uptime', telemetry: state.telemetry.uptime }
    ];
  },
  heap(state) {
    return [
      { name: 'Heap size', telemetry: state.telemetry.HeapSize.value + state.telemetry.HeapSize.unit },
      { name: 'Heap Usage', telemetry: state.telemetry.HeapUsage.value + state.telemetry.HeapUsage.unit },
      { name: 'Used Heap Size', telemetry: state.telemetry.UsedHeapSize.value + state.telemetry.UsedHeapSize.unit }
    ];
  },
  requests(state) {
    return [
      { name: 'Active requests', telemetry: state.telemetry.ActiveRequests },
      { name: 'Active handles', telemetry: state.telemetry.ActiveHandles },
      { name: 'Event Loop Latency', telemetry: state.telemetry.EventLoopLatency.value + state.telemetry.EventLoopLatency.unit }
    ];
  }
};

export default {
  name: 'Telemetry',
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
  mutationTypes: mapValues(mutationTypes, (type) => `Telemetry/${type}`),
  actionTypes: mapValues(actionTypes, (type) => `Telemetry/${type}`)
};
