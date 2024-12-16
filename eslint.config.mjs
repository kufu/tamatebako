import smarthr from 'eslint-config-smarthr'

export default [
  ...smarthr,
  {
    rules: {
      'smarthr/require-barrel-import': 'off',
      'smarthr/best-practice-for-date': 'off',
    }
  },
  {
    files: ['packages/create-lint-set/**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    }
  },
  {
    ignores: ["packages/*/lib/*"],
  }
]
