/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  // env: {
  //   'vitest-globals/env': true,
  // },
  extends: [
    'plugin:vue/vue3-essential',
    // 'plugin:vitest-globals/recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
  ],
  overrides: [
    {
      files: ['test/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'],
      extends: ['plugin:cypress/recommended'],
    },
    // {
    //   files: ['test/unit/**/*.{js,ts,jsx,tsx}'],
    //   env: {
    //     'vitest-globals/env': true,
    //   },
    // },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['~', './src']],
      },
    },
  },
}
