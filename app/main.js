import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { Quasar, Loading } from 'quasar';

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

const app = createApp(App);
const router = createRouter({
  history: createWebHistory(),
  routes
});

app.use(Quasar, { plugins: { Loading } });
app.use(router);

app.mount('#app');
