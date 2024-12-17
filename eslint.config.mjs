import smarthr from 'eslint-config-smarthr'

export default [
  ...smarthr,
  {
    rules: {
      'smarthr/require-barrel-import': 'off', // TODO: 要対応
      'smarthr/best-practice-for-date': 'off', // TODO: 要対応
    }
  },
  {
    files: ['packages/create-lint-set/**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off', // TODO: 要対応
    }
  },
  {
    ignores: ["packages/*/lib/*"],
  }
]
