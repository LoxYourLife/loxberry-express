import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { quasar } from '@quasar/vite-plugin';

module.exports = defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  return {
    base: isProduction ? '/admin/plugins/express' : '',
    root: 'app',
    plugins: [vue(), quasar({ sassVariables: 'app/quasar.extras.sass', autoImportComponentCase: 'combined' })],
    build: {
      outDir: resolve(__dirname, 'build'),
      assetsDir: 'assets',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'app/build.html')
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
        '/admin/express/': {
          target: 'http://localhost:3300/auth',
          changeOrigin: true,
          rewrite: (path) => path.replace('/admin/express/', '/')
        }
      }
    }
  };
});
