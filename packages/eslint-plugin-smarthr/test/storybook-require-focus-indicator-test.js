const rule = require('../rules/storybook-require-focus-indicator-test')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

const ERROR = `Storybookファイルには FocusIndicatorTest Story を追加することを推奨します。
 - focusIndicatorTemplate を使用することで、フォーカスリングの表示チェックができます。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/storybook-focus-indicator`

ruleTester.run('storybook-require-focus-indicator-test', rule, {
  valid: [
    // 通常のTypeScriptファイル（.stories.tsxではない）
    {
      code: 'const foo = 1',
      filename: 'foo.tsx',
    },

    // FocusIndicatorTestが存在する
    {
      code: `
        export const Default = {}
        export const FocusIndicatorTest = focusIndicatorTemplate(Default)
      `,
      filename: 'MyComponent.stories.tsx',
    },

    // focusIndicatorTemplateを使用している
    {
      code: `
        import { focusIndicatorTemplate } from 'storybook-focus-indicator'
        export const Default = {}
        const test = focusIndicatorTemplate(Default)
      `,
      filename: 'MyComponent.stories.tsx',
    },

    // .stories.ts
    {
      code: `
        export const Default = {}
        export const FocusIndicatorTest = {}
      `,
      filename: 'MyComponent.stories.ts',
    },
  ],

  invalid: [
    // FocusIndicatorTestが存在しない
    {
      code: `
        export const Default = {}
        export const Loading = {}
      `,
      filename: 'MyComponent.stories.tsx',
      errors: [{ message: ERROR }],
    },

    // .stories.tsでもチェック
    {
      code: `
        export const Default = {}
      `,
      filename: 'MyComponent.stories.ts',
      errors: [{ message: ERROR }],
    },

    // 名前が違う
    {
      code: `
        export const Default = {}
        export const FocusTest = {}
      `,
      filename: 'MyComponent.stories.tsx',
      errors: [{ message: ERROR }],
    },
  ],
})
