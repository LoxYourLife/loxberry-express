import Page from './components/Page.vue';
import Main from './components/Main.vue';
import Logs from './components/Logs.vue';
import NotFound from './components/NotFound.vue';

export default [
  {
    base: '/admin/plugins/express',
    path: '/',
    component: Page,
    children: [
      { name: 'main', path: '', component: Main },
      { name: 'logs', path: 'logs/', component: Logs }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
];
