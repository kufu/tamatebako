const rule = require('../rules/a11y-scroller-has-tabindex')
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

const { INTERACTIVE_COMPONENT_NAMES } = require('../rules/best-practice-for-interactive-element')

const TABINDEX_VALUE_ERROR = `tabIndex属性には0, -1以外の値を設定しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-scroller-has-tabindex
 - focus可能な要素の順序が意図しづらい状態になってしまうため0、もしくは-1に変更してください`
const SCROLLER_HAS_TABINDEX_ERROR = `scroll可能な要素にはtabIndex={0}を設定してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-scroller-has-tabindex
 - tabIndex={0}を設定することでキーボード操作でアクセスしやすくなります
 - 推奨: smarthr-ui/Scrollerコンポーネントを利用すると、tabIndexが自動的に設定されます`
const NON_INTERACTIVE_TABINDEX_ERROR = (name) => `${name}にtabIndex属性は設定しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-scroller-has-tabindex
 - tabIndex属性はインタラクティブな要素、もしくはscroll可能な要素にのみ設定してください
 - 対応方法1: 対象の要素がインタラクティブなコンポーネントの場合、名称を調整してください
   - "${new RegExp(`(${INTERACTIVE_COMPONENT_NAMES})`)}" の正規表現にmatchするコンポーネントに変更、もしくは名称を調整してください
 - 対応方法2: 対象の要素がscroll可能な要素の場合、smarthr-ui/Scrollerコンポーネントの利用を検討してください
 - 対応方法3: 対象の要素がインタラクティブな要素でない場合、tabIndex属性を削除してください`

ruleTester.run('a11y-scroller-has-tabindex', rule, {
  valid: [
    // tabIndex属性なし
    { code: `<Any />` },
    // overflowクラス + tabIndex={0} (文字列リテラル)
    { code: `<Any className="overflow-auto" tabIndex={0} />` },
    { code: `<Any className="overflow-scroll" tabIndex="0" />` },
    { code: `<Any className="shr-overflow-x-auto" tabIndex={0} />` },
    { code: `<Any className="overflow-y-scroll" tabIndex="0" />` },
    // 複数のクラス名
    { code: `<Any className="foo overflow-auto bar" tabIndex={0} />` },
    // テンプレートリテラルで変数結合
    { code: `<Any className={\`\${hoge} overflow-auto\`} tabIndex={0} />` },
    { code: `<Any className={\`overflow-scroll \${fuga}\`} tabIndex="0" />` },
    { code: `<Any className={\`\${hoge} overflow-x-auto \${fuga}\`} tabIndex={0} />` },
    { code: `<Any className={\`foo \${bar} overflow-y-scroll \${baz} qux\`} tabIndex="0" />` },
    // overflowクラスがない場合
    { code: `<Any className="foo bar" />` },
    { code: `<Any className="overflow-hidden" />` },
    { code: `<Any className="overflow-visible" />` },
    { code: `<Any className={\`\${hoge} foo bar \${fuga}\`} />` },
    // インタラクティブな要素のtabIndex
    { code: `<button tabIndex={0}>...</button>` },
    { code: `<input tabIndex={-1} />` },
    { code: `<Anchor tabIndex={0} />` },
    { code: `<Button tabIndex={-1} />` },
    // overflowクラスを持つ要素のtabIndex
    { code: `<div className="overflow-auto" tabIndex={0} />` },
    { code: `<div className="overflow-x-auto" tabIndex={0} />` },
    { code: `<div className="overflow-y-scroll" tabIndex={0} />` },
    { code: `<div className={\`\${hoge} overflow-auto\`} tabIndex={0} />` },
  ],
  invalid: [
    // tabIndex値のチェック: 無効な値
    { code: `<Any tabIndex={-2} />`, errors: [{ message: TABINDEX_VALUE_ERROR }] },
    { code: `<Any tabIndex="1" />`, errors: [{ message: TABINDEX_VALUE_ERROR }] },
    { code: `<Any tabIndex="2" />`, errors: [{ message: TABINDEX_VALUE_ERROR }] },
    { code: `<Any tabIndex={1} />`, errors: [{ message: TABINDEX_VALUE_ERROR }] },
    { code: `<Any tabIndex={10} />`, errors: [{ message: TABINDEX_VALUE_ERROR }] },
    // overflowクラスあり + tabIndexなし (文字列リテラル)
    { code: `<Any className="overflow-auto" />`, errors: [{ message: SCROLLER_HAS_TABINDEX_ERROR }] },
    { code: `<Any className="overflow-scroll" />`, errors: [{ message: SCROLLER_HAS_TABINDEX_ERROR }] },
    { code: `<Any className="shr-overflow-x-auto" />`, errors: [{ message: SCROLLER_HAS_TABINDEX_ERROR }] },
    { code: `<Any className="overflow-y-scroll" />`, errors: [{ message: SCROLLER_HAS_TABINDEX_ERROR }] },
    // overflowクラスあり + tabIndex={-1} (文字列リテラル)
    { code: `<Any className="overflow-auto" tabIndex={-1} />`, errors: [{ message: SCROLLER_HAS_TABINDEX_ERROR }] },
    { code: `<Any className="shr-overflow-x-scroll" tabIndex="-1" />`, errors: [{ message: SCROLLER_HAS_TABINDEX_ERROR }] },
    { code: `<Any className="overflow-y-auto" tabIndex={-1} />`, errors: [{ message: SCROLLER_HAS_TABINDEX_ERROR }] },
    // 複数のクラス名
    { code: `<Any className="foo overflow-auto bar" />`, errors: [{ message: SCROLLER_HAS_TABINDEX_ERROR }] },
    // テンプレートリテラルで変数結合
    { code: `<Any className={\`\${hoge} overflow-auto\`} />`, errors: [{ message: SCROLLER_HAS_TABINDEX_ERROR }] },
    { code: `<Any className={\`overflow-scroll \${fuga}\`} tabIndex={-1} />`, errors: [{ message: SCROLLER_HAS_TABINDEX_ERROR }] },
    { code: `<Any className={\`\${hoge} overflow-x-auto \${fuga}\`} />`, errors: [{ message: SCROLLER_HAS_TABINDEX_ERROR }] },
    { code: `<Any className={\`foo \${bar} overflow-y-scroll \${baz} qux\`} tabIndex="-1" />`, errors: [{ message: SCROLLER_HAS_TABINDEX_ERROR }] },
    // インタラクティブでない要素のtabIndex
    { code: `<div tabIndex={0} />`, errors: [{ message: NON_INTERACTIVE_TABINDEX_ERROR('div') }] },
    { code: `<Stack tabIndex={0} />`, errors: [{ message: NON_INTERACTIVE_TABINDEX_ERROR('Stack') }] },
    { code: `<span tabIndex={-1} />`, errors: [{ message: NON_INTERACTIVE_TABINDEX_ERROR('span') }] },
  ]
})
