const rule = require('../rules/autofixer-smarthr-ui-migration')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

const v90ToV91Options = [{ from: 'v90', to: 'v91' }]

ruleTester.run('autofixer-smarthr-ui-migration', rule, {
  valid: [
    // v91 形式: Dialog コンポーネント
    { code: `import { ControlledActionDialog } from 'smarthr-ui'`, options: v90ToV91Options },
    { code: `import { ControlledFormDialog } from 'smarthr-ui'`, options: v90ToV91Options },
    { code: `import { ControlledMessageDialog } from 'smarthr-ui'`, options: v90ToV91Options },
    { code: `import { ControlledStepFormDialog } from 'smarthr-ui'`, options: v90ToV91Options },
    { code: `<ControlledActionDialog>Xxxx</ControlledActionDialog>`, options: v90ToV91Options },
    { code: `<ControlledFormDialog>Xxxx</ControlledFormDialog>`, options: v90ToV91Options },

    // v91 形式: ResponseMessage
    { code: `<ResponseMessage status="success">Xxxx</ResponseMessage>`, options: v90ToV91Options },
    { code: `<ResponseMessage status="error">Xxxx</ResponseMessage>`, options: v90ToV91Options },

    // v91 形式: Heading with icon.gap
    { code: `<Heading icon={{ prefix: <FaCheckIcon />, gap: 0.5 }}>Xxxx</Heading>`, options: v90ToV91Options },

    // v91 形式: AppHeader (arbitraryDisplayName なし)
    { code: `<AppHeader email="test@example.com" />`, options: v90ToV91Options },
  ],
  invalid: [
    // オプション未指定時のエラー
    {
      code: `import { ActionDialog } from 'smarthr-ui'`,
      errors: [{ messageId: 'missingOptions' }],
    },

    // サポートされていないバージョン
    {
      code: `import { ActionDialog } from 'smarthr-ui'`,
      options: [{ from: 'v91', to: 'v92' }],
      errors: [{ messageId: 'unsupportedVersion' }],
    },

    // 1. Dialog コンポーネントのリネーム: import
    {
      code: `import { ActionDialog } from 'smarthr-ui'`,
      output: `import { ControlledActionDialog } from 'smarthr-ui'`,
      options: v90ToV91Options,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'ActionDialog', new: 'ControlledActionDialog', to: 'v91' },
        },
      ],
    },
    {
      code: `import { FormDialog } from 'smarthr-ui'`,
      output: `import { ControlledFormDialog } from 'smarthr-ui'`,
      options: v90ToV91Options,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'FormDialog', new: 'ControlledFormDialog', to: 'v91' },
        },
      ],
    },
    {
      code: `import { MessageDialog } from 'smarthr-ui'`,
      output: `import { ControlledMessageDialog } from 'smarthr-ui'`,
      options: v90ToV91Options,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'MessageDialog', new: 'ControlledMessageDialog', to: 'v91' },
        },
      ],
    },
    {
      code: `import { StepFormDialog } from 'smarthr-ui'`,
      output: `import { ControlledStepFormDialog } from 'smarthr-ui'`,
      options: v90ToV91Options,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'StepFormDialog', new: 'ControlledStepFormDialog', to: 'v91' },
        },
      ],
    },
    {
      code: `import { ActionDialog, FormDialog } from 'smarthr-ui'`,
      output: `import { ControlledActionDialog, ControlledFormDialog } from 'smarthr-ui'`,
      options: v90ToV91Options,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'ActionDialog', new: 'ControlledActionDialog', to: 'v91' },
        },
        {
          messageId: 'renameDialog',
          data: { old: 'FormDialog', new: 'ControlledFormDialog', to: 'v91' },
        },
      ],
    },

    // 1. Dialog コンポーネントのリネーム: JSX
    {
      code: `<ActionDialog>Xxxx</ActionDialog>`,
      output: `<ControlledActionDialog>Xxxx</ControlledActionDialog>`,
      options: v90ToV91Options,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'ActionDialog', new: 'ControlledActionDialog', to: 'v91' },
        },
      ],
    },
    {
      code: `<FormDialog>Xxxx</FormDialog>`,
      output: `<ControlledFormDialog>Xxxx</ControlledFormDialog>`,
      options: v90ToV91Options,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'FormDialog', new: 'ControlledFormDialog', to: 'v91' },
        },
      ],
    },
    {
      code: `<MessageDialog>Xxxx</MessageDialog>`,
      output: `<ControlledMessageDialog>Xxxx</ControlledMessageDialog>`,
      options: v90ToV91Options,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'MessageDialog', new: 'ControlledMessageDialog', to: 'v91' },
        },
      ],
    },
    {
      code: `<StepFormDialog>Xxxx</StepFormDialog>`,
      output: `<ControlledStepFormDialog>Xxxx</ControlledStepFormDialog>`,
      options: v90ToV91Options,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'StepFormDialog', new: 'ControlledStepFormDialog', to: 'v91' },
        },
      ],
    },
    {
      code: `<ActionDialog />`,
      output: `<ControlledActionDialog />`,
      options: v90ToV91Options,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'ActionDialog', new: 'ControlledActionDialog', to: 'v91' },
        },
      ],
    },

    // 2. ResponseMessage の type → status
    {
      code: `<ResponseMessage type="success">Xxxx</ResponseMessage>`,
      output: `<ResponseMessage status="success">Xxxx</ResponseMessage>`,
      options: v90ToV91Options,
      errors: [{ messageId: 'renameType' }],
    },
    {
      code: `<ResponseMessage type="error">Xxxx</ResponseMessage>`,
      output: `<ResponseMessage status="error">Xxxx</ResponseMessage>`,
      options: v90ToV91Options,
      errors: [{ messageId: 'renameType' }],
    },
    {
      code: `<ResponseMessage type="info">Xxxx</ResponseMessage>`,
      output: `<ResponseMessage status="info">Xxxx</ResponseMessage>`,
      options: v90ToV91Options,
      errors: [{ messageId: 'renameType' }],
    },

    // 3. ResponseMessage の right 属性削除（エラーのみ、修正なし）
    {
      code: `<ResponseMessage right>Xxxx</ResponseMessage>`,
      output: null,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeRight' }],
    },
    {
      code: `<ResponseMessage right={true}>Xxxx</ResponseMessage>`,
      output: null,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeRight' }],
    },

    // 4. ResponseMessage の iconGap: パターンC（適切な親がない）
    {
      code: `<div><ResponseMessage iconGap={0.5}>Xxxx</ResponseMessage></div>`,
      output: `<div><ResponseMessage>Xxxx</ResponseMessage></div>`,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeIconGap' }],
    },
    {
      code: `<Stack><ResponseMessage iconGap={0.5}>Xxxx</ResponseMessage></Stack>`,
      output: `<Stack><ResponseMessage>Xxxx</ResponseMessage></Stack>`,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeIconGap' }],
    },

    // 4. ResponseMessage の iconGap: 単純削除
    {
      code: `<ResponseMessage status="success" iconGap={0.5}>Xxxx</ResponseMessage>`,
      output: `<ResponseMessage status="success">Xxxx</ResponseMessage>`,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeIconGap' }],
    },
    {
      code: `<Heading><ResponseMessage status="success" iconGap={0.5}>Xxxx</ResponseMessage></Heading>`,
      output: `<Heading><ResponseMessage status="success">Xxxx</ResponseMessage></Heading>`,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeIconGap' }],
    },

    // 5. AppHeader の arbitraryDisplayName 削除
    {
      code: `<AppHeader arbitraryDisplayName="山田太郎" email="test@example.com" />`,
      output: `<AppHeader email="test@example.com" />`,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeArbitraryDisplayName' }],
    },
    {
      code: `<AppHeader arbitraryDisplayName={userName} />`,
      output: `<AppHeader />`,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeArbitraryDisplayName' }],
    },
  ],
})
