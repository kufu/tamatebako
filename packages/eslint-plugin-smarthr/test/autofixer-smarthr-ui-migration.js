const rule = require('../rules/autofixer-smarthr-ui-migration')
const RuleTester = require('eslint').RuleTester
const v90ToV91Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v90-to-v91/test')

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
      options: [{ from: '91', to: '92' }],
      errors: [{ messageId: 'unsupportedVersion' }],
    },

    // ============================================================
    // 複数バージョンスキップ
    // ============================================================
    {
      code: `import { ActionDialog } from 'smarthr-ui'`,
      output: `import { ControlledActionDialog } from 'smarthr-ui'`,
      options: [{ from: '90', to: '92' }],
      errors: [
        { messageId: 'skippedVersion', data: { version: 'v92' } },
        { messageId: 'renameDialog', data: { old: 'ActionDialog', new: 'ControlledActionDialog', to: 'v91' } },
      ],
    },
    {
      code: `import { ActionDialog } from 'smarthr-ui'`,
      output: `import { ControlledActionDialog } from 'smarthr-ui'`,
      options: [{ from: '90', to: '93' }],
      errors: [
        { messageId: 'skippedVersion', data: { version: 'v92' } },
        { messageId: 'skippedVersion', data: { version: 'v93' } },
        { messageId: 'renameDialog', data: { old: 'ActionDialog', new: 'ControlledActionDialog', to: 'v91' } },
      ],
    },

    // ============================================================
    // version固有のテストケース
    // ============================================================
    ...v90ToV91Tests.invalid,
  ],
})
