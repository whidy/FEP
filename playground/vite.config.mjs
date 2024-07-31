import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'

function resolve_path(dir) {
  return path.join(__dirname, './', dir)
}
export default defineConfig({
  plugins: [vue(), vueJsx()],
  css: {
    preprocessorOptions: {
      less: { javascriptEnabled: true },
    },
  },
  resolve: {
    alias: [
      {
        find: /^@formily\/element-plus$/,
        replacement: resolve_path('../packages/components/src'),
      },
      {
        find: /^@formily\/element-plus-renderer$/,
        replacement: resolve_path('../packages/renderer/src'),
      },
      {
        find: /^@formily\/element-plus-prototypes$/,
        replacement: resolve_path('../packages/prototypes/src'),
      },
      {
        find: /^@formily\/element-plus-setters$/,
        replacement: resolve_path('../packages/setters/src'),
      },
      {
        find: /^@formily\/element-plus-settings-form$/,
        replacement: resolve_path('../packages/settings-form/src'),
      },
    ],
  },
  // build: {
  //   commonjsOptions: {
  //     include: [/node_modules/, /packages\//],
  //   },
  // },
  server: {
    host: '0.0.0.0',
    port: 8098,
    hmr: true,
    proxy: {
      '/xc/core/api/': {
        target: 'https://xc-cloud.dev.wodcloud.com',
        changeOrigin: true,
        secure: false,
      },
      '/xc/components/api/': {
        target: 'https://xc-cloud.dev.wodcloud.com',
        changeOrigin: true,
        secure: false,
      },
      '/xc/datacomputing/api': {
        target: 'https://xc-cloud.dev.wodcloud.com',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:8080'
            : 'https://form-store.wodcloud.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
