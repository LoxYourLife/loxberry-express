<template>
  <q-layout view="hHh lpR fFf" data-role="none">
    <q-page-container>
      <div class="q-pa-s">
        <div class="mainTab q-gutter-y-md bg-light-green-7">
          <q-tabs inline-label dense class="text-grey-3 bg-light-green-6" active-color="white bg-light-green-7" indicator-color="light-green-9" align="justify">
            <q-route-tab :to="{name: 'main'}" name="telemetry" icon="settings" label="Settings" data-role="none" />
            <q-route-tab :to="{name: 'logs'}" name="logs" icon="article" label="Logs" data-role="none" />
          </q-tabs>
        </div>
      </div>
      <q-separator vertical inset />
      <q-page padding>
        <div class="row">
          <div class="col-6 text-h4 self-end">Express Server
            <q-btn label="Open Documentation" class="q-ml-xl" outline no-caps href="https://loxwiki.atlassian.net/wiki/spaces/LOXBERRY/pages/1673527328/Express+Server" target="_blank" data-role="none" />
          </div>
          <div class="col-6 text-right q-gutter-sm">
            <q-spinner v-if="btnDisabled" color="primary" size="2em" :thickness="10" />
            <q-btn :disabled="forceRestartDisabled" v-if="connectionError" icon="restart_alt" size="md" color="orange-6" label="Restart Server" @click="forceRestart" data-role="none" />
            <q-btn :disabled="btnDisabled" v-else icon="restart_alt" size="md" color="orange-6" label="Restart Server" @click="restart" data-role="none" />
            <q-btn :disabled="btnDisabled" v-if="isOnline" icon="stop" size="md" color="red-6" label="Stop Server" @click="stop" data-role="none" />
            <q-btn :disabled="btnDisabled" v-else icon="play_arrow" size="md" color="light-green-6" label="Start Server" @click="start" data-role="none" />
          </div>
        </div>
        <q-separator vertical inset />

        <router-view />

      </q-page>
    </q-page-container>
  </q-layout>

</template>

<style lang="sass">
@import '@quasar/extras/material-icons/material-icons.css'
@import 'quasar/src/css/index.sass'

/* Loxberry 3 Layout fix */
#main1 .ui-header .container > .column
  flex-direction: inherit
  display: block

#app .ui-btn
  margin-bottom: 0
  width: auto

h1.ui-title
  font-weight: 700
  line-height: 21px
  letter-spacing: normal

#page_content, #app .ui-checkbox
  margin: 0 !important
.q-page a
  text-shadow: none !important

.q-tab-panel.route
  padding: 16px 0

.mainTab .q-tab--inactive
  color: rgb(255 255 255 / 81%) !important

.q-tab__content--inline .q-tab__label
  text-shadow: none !important
</style>

<script>
import { ref, computed, onBeforeUnmount } from 'vue';
import { get as _get, isNil } from 'lodash';
import { useStore, mapState, mapGetters } from 'vuex';
import actionStore from './store/actions';
import telemetryStore from './store/telemetry';
import logStore from './store/log';

export default {
  computed: {
    ...mapState('Global', {
      isLoading: 'isLoading'
    }),
    ...mapState('Settings', { config: 'config' }),
    ...mapGetters('Telemetry', { isOnline: 'isOnline', btnDisabled: 'disabled' })
  },
  setup() {
    const store = useStore();
    const config = computed(() => store.state.Settings.config);

    const forceRestartDisabled = ref(false);
    const connectionError = ref(null);

    let webSocket;
    let unmounted = false;
    onBeforeUnmount(() => {
      unmounted = true;
      webSocket.close();
    });
    const loadConfig = async () => {
      await store.dispatch(actionStore.actionTypes.LOAD_SETTINGS);
      loadTelemetry();
    };

    const loadTelemetry = async () => {
      const [host] = window.location.host.split(':');
      webSocket = new WebSocket(`ws://${host}:${config.value.managerPort}`);
      webSocket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.telemetry) {
            store.commit(telemetryStore.mutationTypes.SET_TELEMETRY, data.telemetry);
          } else if (data.logs) {
            store.commit(logStore.mutationTypes.ADD_LOG, data.logs);
          } else if (data.errorLogs) {
            store.commit(logStore.mutationTypes.ADD_ERROR_LOG, data.errorLogs);
          }
        } catch {}
      };
      webSocket.onopen = () => {
        store.commit(telemetryStore.mutationTypes.SET_STATUS, 'connected ...');
        connectionError.value = null;
      };
      webSocket.onerror = (e) => {
        connectionError.value = e;
      };
      webSocket.onclose = (e) => {
        webSocket = null;
        store.commit(telemetryStore.mutationTypes.SET_STATUS, 'connecting ...');
        if (!unmounted && connectionError.value === null) setTimeout(loadTelemetry, 5000);
      };
    };

    const sendCommand = (command) => {
      if (isNil(webSocket)) return;
      if (command === 'start') store.commit(telemetryStore.mutationTypes.SET_STATUS, 'starting ...');
      else if (command === 'stop') store.commit(telemetryStore.mutationTypes.SET_STATUS, 'stopping ...');
      else if (command === 'restart') store.commit(telemetryStore.mutationTypes.SET_STATUS, 'restarting ...');

      webSocket.send(JSON.stringify({ command }));
    };

    const start = () => sendCommand('start');
    const stop = () => sendCommand('stop');
    const restart = () => sendCommand('restart');

    const forceRestart = async () => {
      forceRestartDisabled.value = true;
      try {
        await store.dispatch(actionStore.actionTypes.FORCE_RESTART, null, { root: true });
        if (connectionError.value !== null) {
          loadTelemetry();
        }
        forceRestartDisabled.value = false;
      } catch {
        forceRestartDisabled.value = false;
      }
    };
    loadConfig();

    return {
      start,
      stop,
      restart,
      forceRestart,
      forceRestartDisabled,
      connectionError
    };
  }
};
</script>