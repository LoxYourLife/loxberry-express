import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createStore } from 'vuex';
import routes from './routes';
import { Quasar, Loading } from 'quasar';
import settingsStore from './store/settings';
import globalStore from './store/global';
import actionStore from './store/actions';
import telemetryStore from './store/telemetry';
import logStore from './store/log';

const app = createApp(App);
const router = createRouter({
  history: createWebHistory(),
  routes
});

const store = createStore({
  modules: {
    [globalStore.name]: globalStore,
    [settingsStore.name]: settingsStore,
    [actionStore.name]: actionStore,
    [telemetryStore.name]: telemetryStore,
    [logStore.name]: logStore
  }
});
app.use(Quasar, { plugins: { Loading } });
app.use(router);
app.use(store);

app.mount('#expressServer');
