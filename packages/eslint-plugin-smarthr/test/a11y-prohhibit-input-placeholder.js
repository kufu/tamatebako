const rule = require('../rules/a11y-prohibit-input-placeholder')
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
ruleTester.run('a11y-prohibit-input-placeholder', rule, {
  valid: [
    { code: `<input />` },
    { code: `<textarea />` },
    { code: `<FieldSet />` },
    { code: `<ComboBox />` },
    { code: `<StyledInput />` },
    { code: `<HogeTextarea />` },
    { code: `<FugaFieldSet />` },
    { code: `<CustomComboBox />` },
    { code: `<SearchInput />` },
    { code: `<DatePicker />` },
    { code: `<WarekiPicker />` },
    { code: `<TimePicker />` },
    { code: `<CustomSearchInput tooltipMessage="hoge" />` },
    { code: `<CustomSearchInput tooltipMessage="hoge" placeholder="fuga" />` },
    { code: `<ComboBox defaultItem={items[0]} />` },
    { code: `<ComboBox defaultItem={items[0]} dropdownHelpMessage="fuga" />` },
    { code: `<ComboBox placeholder="hoge" dropdownHelpMessage="fuga" />` },
  ],
  invalid: [
    { code: `<input placeholder />`, errors: [ { message: `input にはplaceholder属性は設定せず、別途ヒント用要素の利用を検討してください。(例: '<div><input /><Hint>ヒント</Hint></div>')
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-placeholder` } ] },
    { code: `<textarea placeholder="hoge" />`, errors: [ { message: `textarea にはplaceholder属性は設定せず、別途ヒント用要素の利用を検討してください。(例: '<div><textarea /><Hint>ヒント</Hint></div>')
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-placeholder` } ] },
    { code: `<StyledInput placeholder={any} />`, errors: [ { message: `StyledInput にはplaceholder属性は設定せず、別途ヒント用要素の利用を検討してください。(例: '<div><StyledInput /><Hint>ヒント</Hint></div>')
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-placeholder` } ] },
    { code: `<HogeTextarea placeholder="any" />`, errors: [ { message: `HogeTextarea にはplaceholder属性は設定せず、別途ヒント用要素の利用を検討してください。(例: '<div><HogeTextarea /><Hint>ヒント</Hint></div>')
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-placeholder` } ] },
    { code: `<HogeFieldSet placeholder="any" />`, errors: [ { message: `HogeFieldSet にはplaceholder属性は設定せず、別途ヒント用要素の利用を検討してください。(例: '<div><HogeFieldSet /><Hint>ヒント</Hint></div>')
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-placeholder` } ] },
    { code: `<HogeDatePicker placeholder="any" />`, errors: [ { message: `HogeDatePicker にはplaceholder属性は設定せず、別途ヒント用要素の利用を検討してください。(例: '<div><HogeDatePicker /><Hint>ヒント</Hint></div>')
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-placeholder` } ] },
    { code: `<HogeWarekiPicker placeholder="any" />`, errors: [ { message: `HogeWarekiPicker にはplaceholder属性は設定せず、別途ヒント用要素の利用を検討してください。(例: '<div><HogeWarekiPicker /><Hint>ヒント</Hint></div>')
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-placeholder` } ] },
    { code: `<HogeComboBox placeholder="any" />`, errors: [ { message: `HogeComboBox にはplaceholder属性は設定せず、以下のいずれか、もしくは組み合わせての対応を検討してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-placeholder
 - 選択肢をどんな値で絞り込めるかの説明をしたい場合は dropdownHelpMessage 属性に変更してください。
 - 空の値の説明のためにplaceholderを利用している場合は defaultItem 属性に変更してください。
 - 上記以外の説明を行いたい場合、ヒント用要素を設置してください。(例: '<div><HogeComboBox /><Hint>ヒント</Hint></div>')` } ] },
    { code: `<SearchInput placeholder="any" />`, errors: [ { message: `SearchInput にはplaceholder属性を単独で利用せず、tooltipMessageオプションのみ、もしくはplaceholderとtooltipMessageの併用を検討してください。 (例: '<SearchInput tooltipMessage="ヒント" />', '<SearchInput tooltipMessage={hint} placeholder={hint} />')
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-placeholder` } ] },
    { code: `<ComboBox defaultItem={items[0]} placeholder="any" />`, errors: [ { message: `ComboBox にはdefaultItemが設定されているため、placeholder属性を閲覧出来ません。削除してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-placeholder` } ] },
  ]
})
