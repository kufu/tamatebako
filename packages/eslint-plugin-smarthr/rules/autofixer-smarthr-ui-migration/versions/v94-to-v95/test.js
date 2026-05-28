/**
 * smarthr-ui v94 → v95 移行ルール テストケース
 */

const v94ToV95Options = [{ from: '94', to: '95' }]

// ============================================================
// validテストケース（エラーにならないコード）
// ============================================================

const valid = [
  // decoratorsなし
  { code: '<LanguageSwitcher />', options: v94ToV95Options },
  { code: '<AppLauncher />', options: v94ToV95Options },
  { code: '<InputFile />', options: v94ToV95Options },

  // 既に新しい属性を使用
  { code: '<FormDialog actionButton="保存" />', options: v94ToV95Options },
  { code: '<FormDialog actionButton={{ text: "削除", theme: "danger" }} />', options: v94ToV95Options },
  { code: '<ActionDialog actionButton="実行" closeButton="キャンセル" />', options: v94ToV95Options },
  { code: '<MessageDialog closeButton="OK" />', options: v94ToV95Options },

  // 対象外のコンポーネント
  { code: '<ThCheckbox decorators={{ selectAll: () => "全選択" }} />', options: v94ToV95Options },
  { code: '<OtherComponent actionText="保存" />', options: v94ToV95Options },
]

// ============================================================
// invalidテストケース（エラーになり、自動修正されるコード）
// ============================================================

const invalid = [
  // ============================================================
  // LanguageSwitcher, AppLauncher の decorators 属性削除
  // ============================================================

  // LanguageSwitcher
  {
    code: '<LanguageSwitcher decorators={{ triggerLabel: () => "Language" }} />',
    output: '<LanguageSwitcher />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'removeDecorators',
        data: { component: 'LanguageSwitcher', to: 'v95' },
      },
    ],
  },

  // AppLauncher
  {
    code: '<AppLauncher decorators={{ triggerLabel: () => "Apps" }} />',
    output: '<AppLauncher />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'removeDecorators',
        data: { component: 'AppLauncher', to: 'v95' },
      },
    ],
  },

  // 改行あり
  {
    code: `<LanguageSwitcher
  decorators={{ triggerLabel: () => "言語" }}
/>`,
    output: `<LanguageSwitcher
/>`,
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'removeDecorators',
        data: { component: 'LanguageSwitcher', to: 'v95' },
      },
    ],
  },

  // ============================================================
  // InputFile の decorators 属性削除
  // ============================================================

  {
    code: '<InputFile decorators={{ deleteButtonLabel: () => "削除" }} />',
    output: '<InputFile />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'removeDecorators',
        data: { component: 'InputFile', to: 'v95' },
      },
    ],
  },

  // ============================================================
  // FormDialog のボタン属性統合
  // ============================================================

  // actionText のみ（自動修正可能）
  {
    code: '<FormDialog actionText="保存" />',
    output: '<FormDialog actionButton="保存" />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateActionText',
        data: { component: 'FormDialog', to: 'v95' },
      },
    ],
  },

  // actionText + actionTheme（エラーのみ、自動修正なし）
  {
    code: '<FormDialog actionText="削除" actionTheme="danger" />',
    output: null,
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateActionText',
        data: { component: 'FormDialog', to: 'v95' },
      },
      {
        messageId: 'migrateActionTheme',
        data: { component: 'FormDialog', to: 'v95' },
      },
    ],
  },

  // actionText + actionDisabled（エラーのみ、自動修正なし）
  {
    code: '<FormDialog actionText="保存" actionDisabled={true} />',
    output: null,
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateActionText',
        data: { component: 'FormDialog', to: 'v95' },
      },
      {
        messageId: 'migrateActionDisabled',
        data: { component: 'FormDialog', to: 'v95' },
      },
    ],
  },

  // closeDisabled（エラーのみ、自動修正なし）
  {
    code: '<FormDialog actionText="保存" closeDisabled={true} />',
    output: '<FormDialog actionButton="保存" closeDisabled={true} />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateActionText',
        data: { component: 'FormDialog', to: 'v95' },
      },
      {
        messageId: 'migrateCloseDisabled',
        data: { component: 'FormDialog', to: 'v95' },
      },
    ],
  },

  // decorators.closeButtonLabel（エラーのみ、自動修正なし）
  {
    code: '<FormDialog decorators={{ closeButtonLabel: () => "キャンセル" }} />',
    output: null,
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateDecoratorsCloseButtonLabel',
        data: { component: 'FormDialog', to: 'v95' },
      },
    ],
  },

  // actionButton が既にある場合、actionText を削除
  {
    code: '<FormDialog actionText="保存" actionButton="実行" />',
    output: '<FormDialog actionButton="実行" />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateActionText',
        data: { component: 'FormDialog', to: 'v95' },
      },
    ],
  },

  // closeButton が既にある場合、decorators を削除
  {
    code: '<FormDialog decorators={{ closeButtonLabel: () => "キャンセル" }} closeButton="閉じる" />',
    output: '<FormDialog closeButton="閉じる" />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateDecoratorsCloseButtonLabel',
        data: { component: 'FormDialog', to: 'v95' },
      },
    ],
  },

  // ============================================================
  // ActionDialog のボタン属性統合
  // ============================================================

  // actionText のみ（自動修正可能）
  {
    code: '<ActionDialog actionText="実行" />',
    output: '<ActionDialog actionButton="実行" />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateActionText',
        data: { component: 'ActionDialog', to: 'v95' },
      },
    ],
  },

  // actionText + actionTheme（エラーのみ、自動修正なし）
  {
    code: '<ActionDialog actionText="削除" actionTheme="danger" />',
    output: null,
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateActionText',
        data: { component: 'ActionDialog', to: 'v95' },
      },
      {
        messageId: 'migrateActionTheme',
        data: { component: 'ActionDialog', to: 'v95' },
      },
    ],
  },

  // ============================================================
  // MessageDialog の decorators 削除
  // ============================================================

  // decorators.closeButtonLabel（エラーのみ、自動修正なし）
  {
    code: '<MessageDialog decorators={{ closeButtonLabel: () => "OK" }} />',
    output: null,
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateMessageDialogDecorators',
        data: { to: 'v95' },
      },
    ],
  },

  // closeButton が既にある場合、decorators を削除
  {
    code: '<MessageDialog decorators={{ closeButtonLabel: () => "OK" }} closeButton="閉じる" />',
    output: '<MessageDialog closeButton="閉じる" />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateMessageDialogDecorators',
        data: { to: 'v95' },
      },
    ],
  },

  // 改行あり
  {
    code: `<FormDialog
  actionText="保存"
>
  内容
</FormDialog>`,
    output: `<FormDialog
  actionButton="保存"
>
  内容
</FormDialog>`,
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateActionText',
        data: { component: 'FormDialog', to: 'v95' },
      },
    ],
  },
]

module.exports = { valid, invalid }
