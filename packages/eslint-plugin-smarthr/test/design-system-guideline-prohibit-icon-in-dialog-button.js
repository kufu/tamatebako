const rule = require('../rules/design-system-guideline-prohibit-icon-in-dialog-button')
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

const ERROR_MESSAGE = `Dialogのボタンテキストにアイコン（JSX要素）を含めることはできません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-prohibit-icon-in-dialog-button
 - デザインシステムのガイドラインでは、Dialogのボタンはテキストのみとすることが推奨されています
 - アイコンを使用する場合は、ボタンの外側に配置してください`

ruleTester.run('design-system-guideline-prohibit-icon-in-dialog-button', rule, {
  valid: [
    // ActionDialog: テキストのみ
    { code: `<ActionDialog actionText="保存" />` },
    { code: `<ActionDialog actionText={t('save')} />` },
    { code: `<ActionDialog actionText={actionLabel} />` },

    // FormDialog: テキストのみ
    { code: `<FormDialog actionText="送信" />` },
    { code: `<FormDialog actionText={submitText} />` },

    // RemoteTriggerActionDialog: テキストのみ
    { code: `<RemoteTriggerActionDialog actionText="確認" />` },

    // RemoteTriggerFormDialog: テキストのみ
    { code: `<RemoteTriggerFormDialog actionText="登録" />` },

    // StepFormDialog（旧API）: テキストのみ
    { code: `<StepFormDialog submitLabel="次へ" />` },
    { code: `<StepFormDialog submitLabel={nextLabel} />` },

    // StepFormDialog（新API）: テキストのみ
    { code: `<StepFormDialog submitButton={{ text: "送信" }} />` },
    { code: `<StepFormDialog submitButton={{ text: submitText }} />` },
    { code: `<StepFormDialog closeButton={{ text: "閉じる" }} />` },
    { code: `<StepFormDialog backButton={{ text: "戻る" }} />` },
    { code: `<StepFormDialog submitButton={{ text: "送信", theme: "primary" }} />` },

    // 他のDialog（対象外）
    { code: `<MessageDialog>message</MessageDialog>` },
    { code: `<ModelessDialog>content</ModelessDialog>` },
  ],
  invalid: [
    // ActionDialog: アイコンを含む
    {
      code: `<ActionDialog actionText={<><Icon name="check" />保存</>} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<ActionDialog actionText={<Icon name="check" />} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<ActionDialog actionText={<FaCheckIcon />} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // FormDialog: アイコンを含む
    {
      code: `<FormDialog actionText={<><Icon name="send" />送信</>} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<FormDialog actionText={<><span>送信</span></>} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // RemoteTriggerActionDialog: アイコンを含む
    {
      code: `<RemoteTriggerActionDialog actionText={<Icon name="confirm" />} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // RemoteTriggerFormDialog: アイコンを含む
    {
      code: `<RemoteTriggerFormDialog actionText={<><Icon />登録</>} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // StepFormDialog（旧API）: アイコンを含む
    {
      code: `<StepFormDialog submitLabel={<><Icon name="next" />次へ</>} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<StepFormDialog submitLabel={<Icon name="next" />} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // StepFormDialog（新API）: アイコンを含む
    {
      code: `<StepFormDialog submitButton={{ text: <><Icon name="send" />送信</> }} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<StepFormDialog submitButton={{ text: <Icon name="send" /> }} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<StepFormDialog closeButton={{ text: <Icon name="close" /> }} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<StepFormDialog backButton={{ text: <><Icon />戻る</> }} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
  ]
})
