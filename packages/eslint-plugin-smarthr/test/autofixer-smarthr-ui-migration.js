const rule = require('../rules/autofixer-smarthr-ui-migration')
const RuleTester = require('eslint').RuleTester
const v90ToV91Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v90-to-v91/test')
const v91ToV92Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v91-to-v92/test')
const v92ToV93Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v92-to-v93/test')

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

ruleTester.run('autofixer-smarthr-ui-migration', rule, {
  valid: [
    ...v90ToV91Tests.valid,
    ...v91ToV92Tests.valid,
    ...v92ToV93Tests.valid,
  ],

  invalid: [
    // ============================================================
    // オプションチェック
    // ============================================================
    {
      code: `import { ActionDialog } from 'smarthr-ui'`,
      errors: [{ messageId: 'missingOptions' }],
    },
    {
      code: `import { ActionDialog } from 'smarthr-ui'`,
      options: [{ from: '93', to: '94' }],
      errors: [{ messageId: 'unsupportedVersion' }],
    },

    // ============================================================
    // 複数バージョンスキップ
    // ============================================================
    {
      code: `import { DropZone } from 'smarthr-ui'`,
      options: [{ from: '92', to: '94' }],
      errors: [
        { messageId: 'skippedVersion', data: { version: 'v94' } },
      ],
    },
    {
      code: `import { ActionDialog } from 'smarthr-ui'`,
      options: [{ from: '90', to: '93' }],
      errors: [{ messageId: 'conflictingMigration', data: { from: '90', to: '93', middle: '91' } }],
    },

    // ============================================================
    // v90→v92 競合テスト（コンポーネント名の衝突により禁止）
    // ============================================================
    {
      code: `import { ActionDialog } from 'smarthr-ui'`,
      options: [{ from: '90', to: '92' }],
      errors: [{ messageId: 'conflictingMigration', data: { from: '90', to: '92', middle: '91' } }],
    },

    // ============================================================
    // version固有のテストケース
    // ============================================================
    ...v90ToV91Tests.invalid,
    ...v91ToV92Tests.invalid,
    ...v92ToV93Tests.invalid,
  ],
})
