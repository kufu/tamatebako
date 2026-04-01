const rule = require('../rules/autofixer-smarthr-ui-v90-to-v91')
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

ruleTester.run('autofixer-smarthr-ui-v90-to-v91', rule, {
  valid: [
    // v91 形式: Dialog コンポーネント
    { code: `import { ControlledActionDialog } from 'smarthr-ui'` },
    { code: `import { ControlledFormDialog } from 'smarthr-ui'` },
    { code: `import { ControlledMessageDialog } from 'smarthr-ui'` },
    { code: `import { ControlledStepFormDialog } from 'smarthr-ui'` },
    { code: `<ControlledActionDialog>Xxxx</ControlledActionDialog>` },
    { code: `<ControlledFormDialog>Xxxx</ControlledFormDialog>` },

    // v91 形式: ResponseMessage
    { code: `<ResponseMessage status="success">Xxxx</ResponseMessage>` },
    { code: `<ResponseMessage status="error">Xxxx</ResponseMessage>` },

    // v91 形式: Heading with icon.gap
    { code: `<Heading icon={{ prefix: <FaCheckIcon />, gap: 0.5 }}>Xxxx</Heading>` },

    // v91 形式: AppHeader (arbitraryDisplayName なし)
    { code: `<AppHeader email="test@example.com" />` },
  ],
  invalid: [
    // 1. Dialog コンポーネントのリネーム: import
    {
      code: `import { ActionDialog } from 'smarthr-ui'`,
      output: `import { ControlledActionDialog } from 'smarthr-ui'`,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'ActionDialog', new: 'ControlledActionDialog' },
        },
      ],
    },
    {
      code: `import { FormDialog } from 'smarthr-ui'`,
      output: `import { ControlledFormDialog } from 'smarthr-ui'`,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'FormDialog', new: 'ControlledFormDialog' },
        },
      ],
    },
    {
      code: `import { MessageDialog } from 'smarthr-ui'`,
      output: `import { ControlledMessageDialog } from 'smarthr-ui'`,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'MessageDialog', new: 'ControlledMessageDialog' },
        },
      ],
    },
    {
      code: `import { StepFormDialog } from 'smarthr-ui'`,
      output: `import { ControlledStepFormDialog } from 'smarthr-ui'`,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'StepFormDialog', new: 'ControlledStepFormDialog' },
        },
      ],
    },
    {
      code: `import { ActionDialog, FormDialog } from 'smarthr-ui'`,
      output: `import { ControlledActionDialog, ControlledFormDialog } from 'smarthr-ui'`,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'ActionDialog', new: 'ControlledActionDialog' },
        },
        {
          messageId: 'renameDialog',
          data: { old: 'FormDialog', new: 'ControlledFormDialog' },
        },
      ],
    },

    // 1. Dialog コンポーネントのリネーム: JSX
    {
      code: `<ActionDialog>Xxxx</ActionDialog>`,
      output: `<ControlledActionDialog>Xxxx</ControlledActionDialog>`,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'ActionDialog', new: 'ControlledActionDialog' },
        },
      ],
    },
    {
      code: `<FormDialog>Xxxx</FormDialog>`,
      output: `<ControlledFormDialog>Xxxx</ControlledFormDialog>`,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'FormDialog', new: 'ControlledFormDialog' },
        },
      ],
    },
    {
      code: `<MessageDialog>Xxxx</MessageDialog>`,
      output: `<ControlledMessageDialog>Xxxx</ControlledMessageDialog>`,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'MessageDialog', new: 'ControlledMessageDialog' },
        },
      ],
    },
    {
      code: `<StepFormDialog>Xxxx</StepFormDialog>`,
      output: `<ControlledStepFormDialog>Xxxx</ControlledStepFormDialog>`,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'StepFormDialog', new: 'ControlledStepFormDialog' },
        },
      ],
    },
    {
      code: `<ActionDialog />`,
      output: `<ControlledActionDialog />`,
      errors: [
        {
          messageId: 'renameDialog',
          data: { old: 'ActionDialog', new: 'ControlledActionDialog' },
        },
      ],
    },

    // 2. ResponseMessage の type → status
    {
      code: `<ResponseMessage type="success">Xxxx</ResponseMessage>`,
      output: `<ResponseMessage status="success">Xxxx</ResponseMessage>`,
      errors: [{ messageId: 'renameType' }],
    },
    {
      code: `<ResponseMessage type="error">Xxxx</ResponseMessage>`,
      output: `<ResponseMessage status="error">Xxxx</ResponseMessage>`,
      errors: [{ messageId: 'renameType' }],
    },
    {
      code: `<ResponseMessage type="info">Xxxx</ResponseMessage>`,
      output: `<ResponseMessage status="info">Xxxx</ResponseMessage>`,
      errors: [{ messageId: 'renameType' }],
    },

    // 3. ResponseMessage の right 属性削除（エラーのみ、修正なし）
    {
      code: `<ResponseMessage right>Xxxx</ResponseMessage>`,
      output: null,
      errors: [{ messageId: 'removeRight' }],
    },
    {
      code: `<ResponseMessage right={true}>Xxxx</ResponseMessage>`,
      output: null,
      errors: [{ messageId: 'removeRight' }],
    },

    // 4. ResponseMessage の iconGap: パターンC（適切な親がない）
    {
      code: `<div><ResponseMessage iconGap={0.5}>Xxxx</ResponseMessage></div>`,
      output: `<div><ResponseMessage>Xxxx</ResponseMessage></div>`,
      errors: [{ messageId: 'removeIconGap' }],
    },
    {
      code: `<Stack><ResponseMessage iconGap={0.5}>Xxxx</ResponseMessage></Stack>`,
      output: `<Stack><ResponseMessage>Xxxx</ResponseMessage></Stack>`,
      errors: [{ messageId: 'removeIconGap' }],
    },

    // 4. ResponseMessage の iconGap: 単純削除
    {
      code: `<ResponseMessage status="success" iconGap={0.5}>Xxxx</ResponseMessage>`,
      output: `<ResponseMessage status="success">Xxxx</ResponseMessage>`,
      errors: [{ messageId: 'removeIconGap' }],
    },
    {
      code: `<Heading><ResponseMessage status="success" iconGap={0.5}>Xxxx</ResponseMessage></Heading>`,
      output: `<Heading><ResponseMessage status="success">Xxxx</ResponseMessage></Heading>`,
      errors: [{ messageId: 'removeIconGap' }],
    },

    // 5. AppHeader の arbitraryDisplayName 削除
    {
      code: `<AppHeader arbitraryDisplayName="山田太郎" email="test@example.com" />`,
      output: `<AppHeader email="test@example.com" />`,
      errors: [{ messageId: 'removeArbitraryDisplayName' }],
    },
    {
      code: `<AppHeader arbitraryDisplayName={userName} />`,
      output: `<AppHeader />`,
      errors: [{ messageId: 'removeArbitraryDisplayName' }],
    },

    // 複合パターン: Dialog rename のみテスト（type + iconGap は fix 範囲が重複するため削除）
  ],
})
