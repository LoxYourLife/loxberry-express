<template>

  <div class="monospaced bg-grey-3">
    <q-virtual-scroll ref="logRef" style="max-height: 550px;" component="q-list" :items="logs" separator @virtual-scroll="onVirtualScroll">
      <template v-slot="{ item, index }">
        <q-item :key="index" dense v-ripple>
          {{item.date.toLocaleDateString()}} {{item.date.toLocaleTimeString()}} {{item.message}}
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
      onVirtualScroll
    };
  }
};
</script>