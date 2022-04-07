<template>
  <div class="row q-mb-md">
    <div class="col-6 q-gutter-sm">
      <q-btn label="Purge Logs" :loading="purgeBtnLoading" @click="purgeLogs" size="sm" color="red-5" icon-right="delete_forever" data-role="none" />
      <q-btn label="Open Logs" href="/admin/express/system/log" target="_blank" size="sm" color="green-4" icon-right="launch" data-role="none" />
    </div>
    <div class="col-5 q-gutter-sm">
      <q-btn label="Purge Error Logs" :loading="purgeErrorBtnLoading" @click="purgeErrorLogs" size="sm" color="red-5" icon-right="delete_forever" data-role="none" />
      <q-btn label="Open Error Logs" href="/admin/express/system/error-log" target="_blank" size="sm" color="green-4" icon-right="launch" data-role="none" />
    </div>
    <div class="col-1">
      <q-toggle v-model="autoScroll" label="Auto scroll" />
    </div>
  </div>
  <q-card class="q-mx-sm">
    <q-tabs v-model="tab" dense class="bg-grey-2" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
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
<style scoped>
.q-tab-panel {
  padding: 0;
}
</style>
<script>
import { ref } from 'vue';
import Log from './Log.vue';
import { useStore, mapState } from 'vuex';
import actionStore from '../store/actions';

export default {
  components: { Log },
  computed: { ...mapState('Log', { logs: 'logs', errorLogs: 'errorLogs' }) },
  setup(pros, { emit }) {
    const store = useStore();
    const tab = ref('log');
    const autoScroll = ref(true);
    const purgeBtnLoading = ref(false);
    const purgeErrorBtnLoading = ref(false);
    const disableAutoScroll = () => (autoScroll.value = false);
    const purgeLogs = async () => {
      purgeBtnLoading.value = true;
      await store.dispatch(actionStore.actionTypes.PURGE_LOGS, null, { root: true });
      emit('logPurged');

      purgeBtnLoading.value = false;
    };
    const purgeErrorLogs = async () => {
      purgeErrorBtnLoading.value = true;
      await store.dispatch(actionStore.actionTypes.PURGE_ERROR_LOGS, null, { root: true });
      emit('errorLogPurged');

      purgeErrorBtnLoading.value = false;
    };
    return {
      tab,
      autoScroll,
      disableAutoScroll,
      purgeLogs,
      purgeErrorLogs,
      purgeBtnLoading,
      purgeErrorBtnLoading
    };
  }
};
</script>