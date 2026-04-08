const rule = require('../rules/autofixer-smarthr-ui-migration')
const RuleTester = require('eslint').RuleTester
const v90ToV91Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v90-to-v91/test')
const v91ToV92Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v91-to-v92/test')

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
      options: [{ from: '92', to: '93' }],
      errors: [{ messageId: 'unsupportedVersion' }],
    },

    // ============================================================
    // 複数バージョンスキップ
    // ============================================================
    {
      code: `import { RemoteTriggerActionDialog } from 'smarthr-ui'`,
      output: `import { ActionDialog } from 'smarthr-ui'`,
      options: [{ from: '91', to: '93' }],
      errors: [
        { messageId: 'skippedVersion', data: { version: 'v93' } },
        { messageId: 'renameRemoteTriggerDialog', data: { old: 'RemoteTriggerActionDialog', new: 'ActionDialog', to: 'v92' } },
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
  ],
})
