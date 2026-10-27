const rule = require('../rules/design-system-guideline-prohibit-unnecessary-object-prop')
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

const MESSAGE = `"trigger"に{ children: ... }のみを指定する場合はobject形式ではなく値を直接指定してください（例: trigger="値"）。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-prohibit-unnecessary-object-prop
 - 詳細な設定が必要な場合のみobject形式を使用してください`

ruleTester.run('design-system-guideline-prohibit-unnecessary-object-prop', rule, {
  valid: [
    // ReactNodeを直接指定
    { code: `<DropdownMenuButton trigger="メニュー">{children}</DropdownMenuButton>` },
    { code: `<DropdownMenuButton trigger={<span>メニュー</span>}>{children}</DropdownMenuButton>` },

    // 必須キー以外の追加プロパティを伴う場合は許容
    { code: `<DropdownMenuButton trigger={{ children: 'メニュー', size: 's' }}>{children}</DropdownMenuButton>` },
    { code: `<DropdownMenuButton trigger={{ children: 'メニュー', onlyIcon: true }}>{children}</DropdownMenuButton>` },

    // spread構文を含む場合は対象外
    { code: `<DropdownMenuButton trigger={{ ...triggerProps }}>{children}</DropdownMenuButton>` },
    { code: `<DropdownMenuButton trigger={{ ...triggerProps, children: 'メニュー' }}>{children}</DropdownMenuButton>` },

    // 対象コンポーネント以外は対象外
    { code: `<OtherButton trigger={{ children: 'メニュー' }}>{children}</OtherButton>` },

    // 対象prop以外は対象外
    { code: `<DropdownMenuButton other={{ children: 'メニュー' }}>{children}</DropdownMenuButton>` },
  ],
  invalid: [
    {
      code: `<DropdownMenuButton trigger={{ children: 'メニュー' }}>{children}</DropdownMenuButton>`,
      output: `<DropdownMenuButton trigger={'メニュー'}>{children}</DropdownMenuButton>`,
      errors: [{ message: MESSAGE }],
    },
    {
      code: `<DropdownMenuButton trigger={{ children: <span>メニュー</span> }}>{children}</DropdownMenuButton>`,
      output: `<DropdownMenuButton trigger={<span>メニュー</span>}>{children}</DropdownMenuButton>`,
      errors: [{ message: MESSAGE }],
    },
    {
      code: `<FugaDropdownMenuButton trigger={{ children: label }}>{children}</FugaDropdownMenuButton>`,
      output: `<FugaDropdownMenuButton trigger={label}>{children}</FugaDropdownMenuButton>`,
      errors: [{ message: MESSAGE }],
    },
  ],
})
