const rule = require('../rules/autofixer-smarthr-ui-migration')
const RuleTester = require('eslint').RuleTester
const v90ToV91Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v90-to-v91/test')
const v91ToV92Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v91-to-v92/test')
const v92ToV93Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v92-to-v93/test')
const v93ToV94Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v93-to-v94/test')
const v94ToV95Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v94-to-v95/test')
const v95ToV96Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v95-to-v96/test')
const v96ToV97Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v96-to-v97/test')
const v97ToV98Tests = require('../rules/autofixer-smarthr-ui-migration/versions/v97-to-v98/test')

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
    ...v93ToV94Tests.valid,
    ...v94ToV95Tests.valid,
    ...v95ToV96Tests.valid,
    ...v96ToV97Tests.valid,
    ...v97ToV98Tests.valid,
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
      options: [{ from: '98', to: '99' }],
      errors: [{ messageId: 'unsupportedVersion' }],
    },

    // ============================================================
    // 複数バージョンスキップ
    // ============================================================
    {
      code: `import { Chip } from 'smarthr-ui'`,
      options: [{ from: '95', to: '98' }],
      // v95-v96とv96-v97の両方が含まれるため、競合エラーになる
      errors: [{ messageId: 'conflictingMigration', data: { from: '95', to: '98', middle: '96' } }],
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
    // v95→v97 競合テスト（v97が検出のみのルールのため禁止）
    // ============================================================
    {
      code: `import { Chip } from 'smarthr-ui'`,
      options: [{ from: '95', to: '97' }],
      errors: [{ messageId: 'conflictingMigration', data: { from: '95', to: '97', middle: '96' } }],
    },

    // ============================================================
    // version固有のテストケース
    // ============================================================
    ...v90ToV91Tests.invalid,
    ...v91ToV92Tests.invalid,
    ...v92ToV93Tests.invalid,
    ...v93ToV94Tests.invalid,
    ...v94ToV95Tests.invalid,
    ...v95ToV96Tests.invalid,
    ...v96ToV97Tests.invalid,
    ...v97ToV98Tests.invalid,
  ],
})
