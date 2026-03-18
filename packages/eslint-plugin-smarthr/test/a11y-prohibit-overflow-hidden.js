const rule = require('../rules/a11y-prohibit-overflow-hidden')
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

const ERROR_MESSAGE = `overflow属性に"hidden"を設定しないでください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-overflow-hidden
 - "overflow: hidden" を設定するとa11y・実装上の問題が発生する可能性があります。可能な限り避けてください
   - 角丸を表現するためにoverflow="hidden"を設定している場合、子要素にborder-radiusを指定するべきです
   - smarthr-uiのコンポーネントにはrounded属性が設定可能なものが多くあります
   - tailwindの場合、"rounded-l"、smarthr-uiを利用している場合は"shr-rounded-l" などでborder-radiusを表現できます
     - https://tailwindcss.com/docs/border-radius`

ruleTester.run('a11y-prohibit-overflow-hidden', rule, {
  valid: [
    // overflow属性なし
    { code: `<Any />` },
    // 有効なoverflow値（文字列リテラル）
    { code: `<Any overflow="any" />` },
    { code: `<Any overflow="visible" />` },
    { code: `<Any overflow="scroll" />` },
    { code: `<Any overflow="auto" />` },
    { code: `<Any overflow="clip" />` },
    { code: `<Any overflow="inherit" />` },
    { code: `<Any overflow="initial" />` },
    // 有効なoverflow値（JSX式）
    { code: `<Any overflow={'visible'} />` },
    { code: `<Any overflow={'auto'} />` },
    { code: `<Any overflow={\`scroll\`} />` },
    { code: `<Any overflow={\`visible\`} />` },
    // 他の属性と組み合わせ
    { code: `<Any className="foo" overflow="auto" />` },
    { code: `<Any overflow="visible" id="bar" />` },
    // 似た名前だが別の属性
    { code: `<Any hidden />` },
    { code: `<Any overflowWrap="hidden" />` },
    // ネストしたコンポーネント
    { code: `<Parent><Child overflow="auto" /></Parent>` },
  ],
  invalid: [
    // 文字列リテラル
    { code: `<Any overflow="hidden" />`, errors: [{ message: ERROR_MESSAGE }] },
    // JSX式（シングルクォート）
    { code: `<Any overflow={'hidden'} />`, errors: [{ message: ERROR_MESSAGE }] },
    // JSX式（ダブルクォート）
    { code: `<Any overflow={"hidden"} />`, errors: [{ message: ERROR_MESSAGE }] },
    // JSX式（テンプレートリテラル）
    { code: `<Any overflow={\`hidden\`} />`, errors: [{ message: ERROR_MESSAGE }] },
    // 他の属性と組み合わせ
    { code: `<Any className="foo" overflow="hidden" />`, errors: [{ message: ERROR_MESSAGE }] },
    { code: `<Any overflow="hidden" id="bar" />`, errors: [{ message: ERROR_MESSAGE }] },
    { code: `<Any className="foo" overflow={'hidden'} id="bar" />`, errors: [{ message: ERROR_MESSAGE }] },
    // ネストしたコンポーネント
    { code: `<Parent><Child overflow="hidden" /></Parent>`, errors: [{ message: ERROR_MESSAGE }] },
  ]
})
