import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

const test = mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      coverage: {
        include: [
          'src/components/*.vue',
          'src/composables/*.ts',
          'src/locale/*.ts',
          'src/utils/*.ts',
        ],
        reportsDirectory: 'test/unit/coverage',
      },
      environment: 'jsdom',
      exclude: [...configDefaults.exclude],
      globals: true,
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)

console.log(test)
export default test
