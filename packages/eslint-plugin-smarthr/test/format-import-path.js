const rule = require('../rules/format-import-path')
const RuleTester = require('eslint').RuleTester
const path = require('path')

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2015,
      sourceType: 'module',
    },
  },
})

const DOMAIN_RULE_ARGS = {
  globalModuleDir: ['./src/modules'],
  domainModuleDir: ['modules'],
  domainConstituteDir: ['components', 'hooks', 'utils'],
  format: { all: 'relative' },
}

// テスト用のファイルパスを作成
const createFilePath = (relativePath) => {
  return path.resolve(__dirname, '../src', relativePath)
}

ruleTester.run('format-import-path', rule, {
  valid: [
    // ============================================================
    // 拡張子除去のテスト
    // ============================================================

    // .presentational などのファイル名の一部は保持される
    {
      code: `import { Header } from './Header.presentational'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
    },

    // .container も保持される
    {
      code: `import { List } from './List.container'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
    },

    // .stories も保持される
    {
      code: `import { meta } from './Button.stories'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
    },
  ],

  invalid: [
    // ============================================================
    // 拡張子除去のテスト（JS/TS拡張子のみ除去）
    // ============================================================

    // .tsx は除去される
    {
      code: `import { Header } from './Header.tsx'`,
      output: `import { Header } from './Header'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: /に修正してください/ }],
    },

    // .ts は除去される
    {
      code: `import { utils } from './utils.ts'`,
      output: `import { utils } from './utils'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: /に修正してください/ }],
    },

    // .jsx は除去される
    {
      code: `import { Button } from './Button.jsx'`,
      output: `import { Button } from './Button'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: /に修正してください/ }],
    },

    // .js は除去される
    {
      code: `import { helper } from './helper.js'`,
      output: `import { helper } from './helper'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: /に修正してください/ }],
    },

    // ============================================================
    // 複数拡張子のテスト（.presentational.tsx など）
    // ============================================================

    // .presentational.tsx → .presentational (.tsxのみ除去)
    {
      code: `import { Header } from './Header.presentational.tsx'`,
      output: `import { Header } from './Header.presentational'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: /に修正してください/ }],
    },

    // .container.ts → .container (.tsのみ除去)
    {
      code: `import { List } from './List.container.ts'`,
      output: `import { List } from './List.container'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: /に修正してください/ }],
    },

    // .stories.tsx → .stories (.tsxのみ除去)
    {
      code: `import { meta } from './Button.stories.tsx'`,
      output: `import { meta } from './Button.stories'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: /に修正してください/ }],
    },
  ],
})
