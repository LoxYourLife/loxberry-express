<template>

  <div class="full-width row justify-start items-stretch content-stretch">
    <div class="q-pr-sm col-md-2 col-sm-4 q-pb-md flex items-stretch content-stretch">
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

</template>
<style lang="scss" scoped>
.log {
  padding: 0;
}
</style>

<script>
import { mapState, mapGetters } from 'vuex';
import { get as _get } from 'lodash';

export default {
  computed: {
    ...mapState('Global', {
      error: 'error',
      isLoading: 'isLoading',
      isSaving: 'isSaving'
    }),
    ...mapState('Telemetry', { telemetry: 'telemetry' }),
    ...mapGetters('Telemetry', { isOnline: 'isOnline', metadata: 'metadata', heap: 'heap', requests: 'requests' })
  }
};
</script>