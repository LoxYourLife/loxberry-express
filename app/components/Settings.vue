<template>
  <div class="row">
    <div class="col-12">
      <div class="text-h5 self-end">Settings</div>
      <q-separator spaced />
    </div>
  </div>
  <div class="row">
    <div class="col-12" v-if="error">
      <q-banner class="bg-red text-white q-my-md">
        <template v-slot:avatar>
          <q-icon name="error" color="error" />
        </template>
        {{error}}
      </q-banner>

    </div>
    <div class="col-5">
      <q-input name="ip" :ref="formFields.expressPort" :disable="isSaving || isLoading" :loading="isLoading" v-model="config.expressPort" label="Express Server Port" hint="Please specify on which port the express server should run. Default port is 3300." :rules="portValidation" data-role="none" />
      <q-input name="port" :ref="formFields.managerPort" :disable="isSaving || isLoading" :loading="isLoading" v-model="config.managerPort" label="Express Manager Port" hint="Please specify on which port the Express Server Manager app should run. This service is providing the telemetry data and the log files and controls the express server." :rules="portValidation" data-role="none" />
    </div>
    <q-space />
    <div class="col-6">
      <div class="text-h5 q-mb-md self-end">Log Level</div>
      <div class="q-gutter-md">
        <q-toggle v-model="config.loglevel.info" keep-color size="lg" color="primary" label="Info" />
        <q-toggle v-model="config.loglevel.debug" keep-color size="lg" color="accent" label="Debug" />
        <q-toggle v-model="config.loglevel.warning" keep-color size="lg" color="warning" label="Warning" />
        <q-toggle v-model="config.loglevel.error" keep-color size="lg" color="negative" label="Error" />
      </div>
    </div>
  </div>
  <div class="row q-my-xl">
    <div class="col-5 text-right">
      <q-btn :loading="isSaving" :disable="!isSaving && isLoading" push color="light-green-7" icon="save" size="md" label="Speichern" @click="saveSettings" />
    </div>
    <q-space />
  </div>

</template>
<style>
div.q-toggle__label {
  font-size: 12px;
}
.q-toggle .ui-checkbox {
  margin: 0 !important;
}
</style>
<script>
import { ref } from 'vue';
import { useStore, mapState } from 'vuex';
import actionStore from '../store/actions';

export default {
  computed: {
    ...mapState('Global', {
      error: 'error',
      isLoading: 'isLoading',
      isSaving: 'isSaving'
    }),
    ...mapState('Settings', { config: 'config' })
  },
  setup() {
    const store = useStore();
    const formFields = {
      expressPort: ref(),
      managerPort: ref()
    };

    const portValidation = [
      (v) => {
        const valid =
          v == null ||
          /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/.test(v);
        return valid || 'Please enter a port between 0 and 65535.';
      }
    ];

    const saveSettings = async () => {
      const fields = Object.values(formFields).filter((field) => field.value && field.value.validate);

      fields.forEach((field) => field.value.validate());
      const errorField = fields.find((field) => field.value.hasError);

      if (errorField === undefined) {
        await store.dispatch(actionStore.actionTypes.SAVE_SETTINGS, null, { root: true });
      }
    };

    return {
      formFields,
      portValidation,
      saveSettings
    };
  }
};
</script>