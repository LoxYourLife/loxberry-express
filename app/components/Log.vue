<template>

  <div class="monospaced bg-grey-3">
    <q-virtual-scroll ref="logRef" style="max-height: 420px;" component="q-list" :items="logs" separator @virtual-scroll="onVirtualScroll">
      <template v-slot="{ item, index }">
        <q-item :key="index" dense :class="textColor(item.level)">
          <q-icon :name="icon(item.level)" size="sm" class="q-mr-xs" />
          <q-badge align="middle" outline :label="item.date" color="grey-8" class="q-mr-xs" />
          <q-badge align="middle" outline :label="item.plugin" color="grey-8" class="q-mr-xs" />
          <span class="text-weight-thin">{{item.plugin}}:</span>
          <span>{{item.message}}<span v-if="item.error" class="pre-line">{{`\n${item.error.replaceAll('>', '&nbsp;&nbsp;')}`}}</span></span>
        </q-item>
      </template>
    </q-virtual-scroll>
  </div>
</template>
<style lang="scss" scoped>
.monospaced {
  font-family: Consolas, 'Andale Mono WT', 'Andale Mono', 'Lucida Console', 'Lucida Sans Typewriter', 'DejaVu Sans Mono',
    'Bitstream Vera Sans Mono', 'Liberation Mono', 'Nimbus Mono L', Monaco, 'Courier New', Courier, monospace;
}
.q-badge {
  max-height: 20px;
}
.pre-line {
  white-space: pre-line;
}
</style>
<script>
import { ref, watch, nextTick, onBeforeMount } from 'vue';
export default {
  emits: ['disableAutoScroll'],
  props: {
    logs: Array,
    autoScroll: Boolean
  },
  setup(props, { emit }) {
    const logRef = ref(null);
    const scrollIndex = ref(0);

    const updateScroll = async () => {
      if (props.autoScroll === true) {
        await nextTick();
        logRef.value.scrollTo(props.logs.length - 1, 'start-force');
      }
    };

    watch([props.logs], updateScroll);
    watch(
      () => props.autoScroll,
      (newState) => {
        if (newState === true) {
          updateScroll();
        }
      }
    );
    onBeforeMount(updateScroll);

    const textColor = (logLevel) => {
      if (logLevel === 'INFO') return 'text-primary';
      if (logLevel === 'ERROR') return 'text-negative';
      if (logLevel === 'WARN') return 'text-warning';
      if (logLevel === 'DEBUG') return 'grey-8';
    };

    const icon = (logLevel) => {
      if (logLevel === 'INFO') return 'info';
      if (logLevel === 'ERROR') return 'error';
      if (logLevel === 'WARN') return 'warning';
      if (logLevel === 'DEBUG') return 'bug_report';
    };
    const onVirtualScroll = ({ index }) => {
      if (props.autoScroll === true && index < scrollIndex.value) {
        emit('disableAutoScroll');
      }
      scrollIndex.value = index;
    };

    return {
      logRef,
      scrollIndex,
      updateScroll,
      onVirtualScroll,
      textColor,
      icon
    };
  }
};
</script>