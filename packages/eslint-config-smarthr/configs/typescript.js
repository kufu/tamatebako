import typeScriptEslint from 'typescript-eslint'
import globals from 'globals'

/**
 * @type {import('eslint').Linter.Config}
 */
export default [
  ...typeScriptEslint.configs.recommended,
  {
    name: 'eslint-config-smarthr/typescript',
    plugins: {
      typescript: typeScriptEslint.plugin
    },
    languageOptions: {
      parser: typeScriptEslint.parser,
      globals: {
        ...globals.browser,
        ...globals.es2015,
        ...globals.commonjs,
      }
    },
    rules: {
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-object-literal-type-assertion': 'off',
      '@typescript-eslint/no-triple-slash-reference': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/prefer-interface': 'off',
      '@typescript-eslint/prefer-namespace-keyword': 'off',
      '@typescript-eslint/unified-signatures': 'warn',
      'no-useless-constructor': 'off',
    }
  }
]
