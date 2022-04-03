<template>

  <div class="row">
    <div class="col-6 text-h4 self-end">Express Telemetry</div>
    <div class="col-6 text-right q-gutter-sm">
      <q-spinner v-if="btnDisabled" color="primary" size="2em" :thickness="10" />
      <q-btn :disabled="btnDisabled" icon="restart_alt" size="md" color="orange-6" label="Restart Server" @click="restart" />
      <q-btn :disabled="btnDisabled" v-if="isOnline" icon="stop" size="md" color="red-6" label="Stop Server" @click="stop" />
      <q-btn :disabled="btnDisabled" v-else icon="play_arrow" size="md" color="light-green-6" label="Start Server" @click="start" />
    </div>
  </div>
  <q-separator spaced />

  <div class="full-width row  justify-start items-stretch content-stretch">
    <div class="q-px-sm col-md-2 col-sm-4 q-pb-md flex items-stretch content-stretch">
      <q-card class="flex full-width content-center" :class="{'bg-light-green-6': isOnline, 'bg-red': !isOnline}">
        <q-card-section class="text-white col-12">
          <template v-if="isOnline">
            <div class="text-h4">Online</div>
            <div class="">PID {{telemetry.pid}}</div>
          </template>
          <div class="text-h4" v-else>{{telemetry.status}}</div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-md-2 col-sm-4 q-px-sm q-pb-md flex items-stretch content-stretch">
      <q-card class="full-width flex justify-center">
        <q-card-section class="row justify-center">
          <div class="text-h5">CPU Usage</div>
          <q-knob readonly :min="0" :max="100" v-model="telemetry.cpu" show-value size="80px" :thickness="0.22" color="lime" track-color="grey-2" class="text-lime text-bold q-ma-md">{{telemetry.cpu}}%</q-knob>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-md-2 col-sm-4 q-px-sm q-pb-md flex items-stretch content-stretch">
      <q-card class="full-width flex justify-center">
        <q-card-section class="flex justify-center">
          <div class="text-h5">Memory</div>
          <q-knob readonly :min="0" :max="100" v-model="telemetry.memory.value" show-value size="80px" :thickness="0.22" color="lime" track-color="grey-2" class="text-lime text-bold q-ma-md">{{telemetry.memory.value}} {{telemetry.memory.unit}}</q-knob>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-md-6 col-sm-12 q-px-sm q-pb-md flex items-stretch content-stretch">
      <q-card class="full-width">
        <q-card-section horizontal class="flex items-center">
          <q-card-section class="">
            <div class="text-h6 q-px-md">Metadata</div>
            <q-list dense>
              <q-item v-for="item in metadata" :key="item.name">
                <q-item-section avatar>
                  <q-item-label>{{item.name}}</q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>{{item.telemetry}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator vertical />

          <q-card-section class="">
            <div class="text-h6 q-px-md">Heap</div>
            <q-list dense>
              <q-item v-for="item in heap" :key="item.name">
                <q-item-section avatar>
                  <q-item-label>{{item.name}}</q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>{{item.telemetry}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator vertical />

          <q-card-section class="">
            <div class="text-h6 q-px-md">Requests</div>
            <q-list dense>
              <q-item v-for="item in requests" :key="item.name">
                <q-item-section avatar>
                  <q-item-label>{{item.name}}</q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>{{item.telemetry}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card-section>
      </q-card>
    </div>
  </div>

  <q-card class="q-mx-sm">
    <q-tabs v-model="tab" dense class="bg-grey-2" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
      <q-toggle v-model="autoScroll" label="Auto scroll" />
      <q-tab name="log" label="Logs" />
      <q-tab name="error" label="Error Log" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="log" class="log">
        <Log :autoScroll="autoScroll" :logs="logs" @disableAutoScroll="disableAutoScroll" />
      </q-tab-panel>
    </q-tab-panels>

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="error" class="log">
        <Log :autoScroll="autoScroll" :logs="errorLogs" @disableAutoScroll="disableAutoScroll" />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>

</template>
<style lang="scss" scoped>
.log {
  padding: 0;
}
</style>

<script>
import { ref, computed, onBeforeUnmount, nextTick } from 'vue';
import { get as _get, isNil } from 'lodash';
import Log from './Log.vue';

export default {
  components: { Log },
  setup() {
    const telemetry = ref({
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
    });
    const logs = ref([]);
    const errorLogs = ref([]);
    const tab = ref('log');
    const autoScroll = ref(true);
    const disableAutoScroll = () => (autoScroll.value = false);

    const btnDisabled = ref(true);
    const get = (path, defaultValue) => _get(telemetry.value, path, defaultValue || null);
    const isOnline = computed(() => {
      if (isNil(get('pid'))) return false;
      const status = get('status', 'stopped');
      return status === 'online';
    });

    const metadata = computed(() => [
      { name: 'Name', telemetry: get('name') },
      { name: 'Version', telemetry: get('version') },
      { name: 'Uptime', telemetry: get('uptime') }
    ]);

    const heap = computed(() => [
      { name: 'Heap size', telemetry: get('HeapSize.value') + get('HeapSize.unit') },
      { name: 'Heap Usage', telemetry: get('HeapUsage.value') + get('HeapUsage.unit') },
      { name: 'Used Heap Size', telemetry: get('UsedHeapSize.value') + get('UsedHeapSize.unit') }
    ]);

    const requests = computed(() => [
      { name: 'Active requests', telemetry: get('ActiveRequests') },
      { name: 'Active handles', telemetry: get('ActiveHandles') },
      { name: 'Event Loop Latency', telemetry: get('EventLoopLatency.value') + get('EventLoopLatency.unit') }
    ]);

    let webSocket;
    let unmounted = false;
    onBeforeUnmount(() => {
      unmounted = true;
      webSocket.close();
    });
    const loadTelemetry = async () => {
      const [host] = window.location.host.split(':');
      webSocket = new WebSocket(`ws://${host}:3301`);
      webSocket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.telemetry) {
            const restartAndDone = telemetry.value.status.startsWith('restarting') && data.telemetry.status === 'online';
            const startAndDone = telemetry.value.status.startsWith('starting') && data.telemetry.status === 'online';
            const stopAndDone = telemetry.value.status.startsWith('stopping') && data.telemetry.status === 'stopped';

            if (restartAndDone || startAndDone || stopAndDone) {
              btnDisabled.value = false;
            }
            telemetry.value = data.telemetry;
          } else if (data.logs) {
            logs.value.push(...data.logs);
          } else if (data.errorLogs) {
            errorLogs.value.push(...data.errorLogs);
          }
        } catch {}
      };
      webSocket.onopen = () => (btnDisabled.value = false);
      webSocket.onclose = (e) => {
        webSocket = null;
        btnDisabled.value = true;
        if (!unmounted) setTimeout(loadTelemetry, 5000);
      };
    };

    const sendCommand = (command) => {
      if (isNil(webSocket)) return;
      if (command === 'start') telemetry.value.status = 'starting ...';
      else if (command === 'stop') telemetry.value.status = 'stopping ...';
      else if (command === 'restart') telemetry.value.status = 'restarting ...';
      btnDisabled.value = true;
      webSocket.send(JSON.stringify({ command }));
    };

    const start = () => sendCommand('start');
    const stop = () => sendCommand('stop');
    const restart = () => sendCommand('restart');

    loadTelemetry();

    return {
      telemetry,
      isOnline,
      metadata,
      heap,
      requests,
      btnDisabled,
      logs,
      start,
      stop,
      restart,
      tab,
      autoScroll,
      disableAutoScroll,
      errorLogs
    };
  }
};
</script>