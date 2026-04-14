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

    // ============================================================
    // 相対パスのテスト（format: { all: 'relative' }）
    // ============================================================

    // 同じドメイン内では相対パス
    {
      code: `import { Abc } from './parts/Abc'`,
      filename: createFilePath('crews/index/views/index.ts'),
      options: [DOMAIN_RULE_ARGS],
    },

    // ============================================================
    // 絶対パスのテスト（format: { all: 'absolute' }）
    // ============================================================

    // 絶対パスで記述されている場合
    {
      code: `import { helper } from '@/modules/utils/helper'`,
      filename: createFilePath('crews/index/views/index.ts'),
      options: [{
        ...DOMAIN_RULE_ARGS,
        format: { all: 'absolute' },
      }],
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
      errors: [{ message: './Header に修正してください\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/format-import-path' }],
    },

    // .ts は除去される
    {
      code: `import { utils } from './utils.ts'`,
      output: `import { utils } from './utils'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: './utils に修正してください\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/format-import-path' }],
    },

    // .jsx は除去される
    {
      code: `import { Button } from './Button.jsx'`,
      output: `import { Button } from './Button'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: './Button に修正してください\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/format-import-path' }],
    },

    // .js は除去される
    {
      code: `import { helper } from './helper.js'`,
      output: `import { helper } from './helper'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: './helper に修正してください\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/format-import-path' }],
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
      errors: [{ message: './Header.presentational に修正してください\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/format-import-path' }],
    },

    // .container.ts → .container (.tsのみ除去)
    {
      code: `import { List } from './List.container.ts'`,
      output: `import { List } from './List.container'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: './List.container に修正してください\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/format-import-path' }],
    },

    // .stories.tsx → .stories (.tsxのみ除去)
    {
      code: `import { meta } from './Button.stories.tsx'`,
      output: `import { meta } from './Button.stories'`,
      filename: createFilePath('components/Page.tsx'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: './Button.stories に修正してください\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/format-import-path' }],
    },

    // ============================================================
    // 絶対パス → 相対パス変換テスト（format: { all: 'relative' }）
    // ============================================================

    // 同じドメイン内のimportは絶対パスから相対パスに変換される
    {
      code: `import { Abc } from '@/crews/index/views/parts/Abc'`,
      output: `import { Abc } from './parts/Abc'`,
      filename: createFilePath('crews/index/views/index.ts'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: './parts/Abc に修正してください\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/format-import-path' }],
    },

    // 同じディレクトリ内のimport
    {
      code: `import { api } from '@/crews/index/adapters/api'`,
      output: `import { api } from './api'`,
      filename: createFilePath('crews/index/adapters/index.ts'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: './api に修正してください\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/format-import-path' }],
    },

    // 親ディレクトリへのimport
    {
      code: `import { slice } from '@/crews/index/slices/slice'`,
      output: `import { slice } from '../slices/slice'`,
      filename: createFilePath('crews/index/views/index.ts'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: '../slices/slice に修正してください\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/format-import-path' }],
    },

    // ============================================================
    // 相対パス → 絶対パス変換テスト（format: { all: 'absolute' }）
    // ============================================================

    // 相対パスから絶対パスに変換される
    {
      code: `import { Abc } from './parts/Abc'`,
      output: `import { Abc } from '@/crews/index/views/parts/Abc'`,
      filename: createFilePath('crews/index/views/index.ts'),
      options: [{
        ...DOMAIN_RULE_ARGS,
        format: { all: 'absolute' },
      }],
      errors: [{ message: '@/crews/index/views/parts/Abc に修正してください\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/format-import-path' }],
    },

    // ============================================================
    // 不必要なディレクトリ遡りの修正テスト
    // ============================================================

    // 過度に遡っている相対パスを修正
    {
      code: `import { Abc } from '../../../crews/index/views/parts/Abc'`,
      output: `import { Abc } from './parts/Abc'`,
      filename: createFilePath('crews/index/views/index.ts'),
      options: [DOMAIN_RULE_ARGS],
      errors: [{ message: './parts/Abc に修正してください\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/format-import-path' }],
    },

    // ============================================================
    // autoモードのテスト
    // ============================================================

    // autoモード: より短い方（相対パス）が選択される
    {
      code: `import { Abc } from '@/crews/index/views/parts/Abc'`,
      output: `import { Abc } from './parts/Abc'`,
      filename: createFilePath('crews/index/views/index.ts'),
      options: [{
        ...DOMAIN_RULE_ARGS,
        format: { all: 'auto' },
      }],
      errors: [{ message: './parts/Abc に修正してください\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/format-import-path' }],
    },

    // autoモード: 遠いファイルは絶対パスが選択される
    {
      code: `import { helper } from '../../../modules/utils/helper'`,
      output: `import { helper } from '@/modules/utils/helper'`,
      filename: createFilePath('crews/index/views/index.ts'),
      options: [{
        ...DOMAIN_RULE_ARGS,
        format: { all: 'auto' },
      }],
      errors: [{ message: '@/modules/utils/helper に修正してください\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/format-import-path' }],
    },
  ],
})
