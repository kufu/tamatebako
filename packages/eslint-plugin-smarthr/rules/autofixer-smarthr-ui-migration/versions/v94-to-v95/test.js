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

  // AppLauncher with triggerLabel
  { code: '<AppLauncher triggerLabel={featureName} />', options: v94ToV95Options },
  { code: '<AppLauncher triggerLabel="Custom Label" />', options: v94ToV95Options },

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

  // AppLauncher（固定値の場合、decoratorsを削除）
  {
    code: '<AppLauncher decorators={{ triggerLabel: () => "Apps" }} />',
    output: '<AppLauncher />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateAppLauncherDecorators',
        data: { to: 'v95' },
      },
    ],
  },

  // AppLauncher（シングルクォートの固定値、decoratorsを削除）
  {
    code: "<AppLauncher decorators={{ triggerLabel: () => 'Apps' }} />",
    output: '<AppLauncher />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateAppLauncherDecorators',
        data: { to: 'v95' },
      },
    ],
  },

  // AppLauncher（動的な値、triggerLabel属性に移行）
  {
    code: '<AppLauncher decorators={{ triggerLabel: () => featureName }} />',
    output: '<AppLauncher triggerLabel={featureName} />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateAppLauncherDecorators',
        data: { to: 'v95' },
      },
    ],
  },

  // AppLauncher（関数呼び出し、triggerLabel属性に移行）
  {
    code: '<AppLauncher decorators={{ triggerLabel: () => getLabel() }} />',
    output: '<AppLauncher triggerLabel={getLabel()} />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateAppLauncherDecorators',
        data: { to: 'v95' },
      },
    ],
  },

  // AppLauncher（オブジェクトプロパティ、triggerLabel属性に移行）
  {
    code: '<AppLauncher decorators={{ triggerLabel: () => labels.app }} />',
    output: '<AppLauncher triggerLabel={labels.app} />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateAppLauncherDecorators',
        data: { to: 'v95' },
      },
    ],
  },

  // AppLauncher（引数あり、自動修正不可）
  {
    code: '<AppLauncher decorators={{ triggerLabel: (lang) => lang === "ja" ? "アプリ" : "Apps" }} />',
    output: null,
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateAppLauncherDecorators',
        data: { to: 'v95' },
      },
    ],
  },

  // AppLauncher（BlockStatement、自動修正不可）
  {
    code: '<AppLauncher decorators={{ triggerLabel: () => { return "Apps" } }} />',
    output: null,
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateAppLauncherDecorators',
        data: { to: 'v95' },
      },
    ],
  },

  // AppLauncher（triggerLabel属性が既にある場合、decoratorsを削除）
  {
    code: '<AppLauncher decorators={{ triggerLabel: () => "Apps" }} triggerLabel={featureName} />',
    output: '<AppLauncher triggerLabel={featureName} />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateAppLauncherDecorators',
        data: { to: 'v95' },
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

  // actionText + actionTheme（自動修正可能）
  {
    code: '<FormDialog actionText="削除" actionTheme="danger" />',
    output: '<FormDialog actionButton={{ text: "削除", theme: "danger" }} />',
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

  // actionText + actionDisabled（自動修正可能）
  {
    code: '<FormDialog actionText="保存" actionDisabled={true} />',
    output: '<FormDialog actionButton={{ text: "保存", disabled: true }} />',
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

  // actionText + actionTheme + actionDisabled（自動修正可能）
  {
    code: '<FormDialog actionText="削除" actionTheme="danger" actionDisabled={false} />',
    output: '<FormDialog actionButton={{ text: "削除", theme: "danger", disabled: false }} />',
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

  // decorators.closeButtonLabel（自動修正可能）
  {
    code: '<FormDialog decorators={{ closeButtonLabel: () => "キャンセル" }} />',
    output: '<FormDialog closeButton="キャンセル" />',
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

  // actionText + actionTheme（自動修正可能）
  {
    code: '<ActionDialog actionText="削除" actionTheme="danger" />',
    output: '<ActionDialog actionButton={{ text: "削除", theme: "danger" }} />',
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

  // decorators.closeButtonLabel（自動修正可能）
  {
    code: '<MessageDialog decorators={{ closeButtonLabel: () => "OK" }} />',
    output: '<MessageDialog closeButton="OK" />',
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

  // decorators.closeButtonLabel（シングルクォート、自動修正可能）
  {
    code: "<MessageDialog decorators={{ closeButtonLabel: () => 'OK' }} />",
    output: '<MessageDialog closeButton="OK" />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateMessageDialogDecorators',
        data: { to: 'v95' },
      },
    ],
  },

  // decorators.closeButtonLabel（変数、自動修正可能）
  {
    code: '<MessageDialog decorators={{ closeButtonLabel: () => buttonLabel }} />',
    output: '<MessageDialog closeButton={buttonLabel} />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateMessageDialogDecorators',
        data: { to: 'v95' },
      },
    ],
  },

  // decorators.closeButtonLabel（BlockStatement、自動修正不可）
  {
    code: '<MessageDialog decorators={{ closeButtonLabel: () => { return "OK" } }} />',
    output: null,
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateMessageDialogDecorators',
        data: { to: 'v95' },
      },
    ],
  },

  // decorators.closeButtonLabel（関数呼び出し、自動修正可能）
  {
    code: '<MessageDialog decorators={{ closeButtonLabel: () => getLabel() }} />',
    output: '<MessageDialog closeButton={getLabel()} />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateMessageDialogDecorators',
        data: { to: 'v95' },
      },
    ],
  },

  // decorators.closeButtonLabel（オブジェクトプロパティ、自動修正可能）
  {
    code: '<MessageDialog decorators={{ closeButtonLabel: () => labels.close }} />',
    output: '<MessageDialog closeButton={labels.close} />',
    options: v94ToV95Options,
    errors: [
      {
        messageId: 'migrateMessageDialogDecorators',
        data: { to: 'v95' },
      },
    ],
  },

  // decorators.closeButtonLabel（引数あり、自動修正不可）
  {
    code: '<MessageDialog decorators={{ closeButtonLabel: (lang) => lang === "ja" ? "OK" : "Close" }} />',
    output: null,
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
