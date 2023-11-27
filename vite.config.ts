import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.js', '.ts'],
  },
  // test: {
  //   coverage: {
  //     include: [
  //       'src/components/*.vue',
  //       'src/composables/*.js',
  //       'src/locale/*.js',
  //       'src/mixins/*.vue',
  //       'src/utils/*.js',
  //     ],
  //     reportsDirectory: 'test/unit/coverage',
  //   },
  //   environment: 'jsdom',
  //   globals: true,
  // },
})
