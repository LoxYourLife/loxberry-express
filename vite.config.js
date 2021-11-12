import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

module.exports = defineConfig({
  base: '',
  plugins: [vue(), quasar({ sassVariables: 'app/quasar.extras.sass' })],
  build: {
    outDir: 'webfrontend/htmlauth/views',
    assetsDir: 'assets',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'vue'
        }
      }
    }
  },
  server: {
    port: 9000,
    proxy: {
      '/admin/plugins/express/node': {
        target: 'http://localhost:3000/plugins/express',
        changeOrigin: true,
        rewrite: (path) => path.replace('/admin/plugins/express/node', '/')
      }
    }
  }
});
