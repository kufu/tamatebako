const rule = require('../rules/a11y-aria-labelledby')
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

const ERROR_MESSAGE = `aria-labelledby属性には画面上に存在する別要素に指定したid属性と同じ値を指定する必要があります。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-aria-labelledby
 - 設定する値を変数化したうえでaria-labelledby属性に設定してください`

ruleTester.run('a11y-aria-labelledby', rule, {
  valid: [
    { code: `<Any aria-labelledby={hoge} />` },
    { code: `<Any aria-labelledby={obj.attr} />` },
    { code: `<Any aria-labelledby={hoge.fuga.toString()} />` },
    { code: '<Any aria-labelledby={`${hoge} ${fuga}`} />' },
  ],
  invalid: [
    // 文字列リテラル
    { code: `<Any aria-labelledby="hoge" />`, errors: [{ message: ERROR_MESSAGE }] },
    // TemplateLiteral - 変数を含み、文字列リテラル部分がある
    { code: '<Any aria-labelledby={`hoge-${fuga}`} />', errors: [{ message: ERROR_MESSAGE }] },
    { code: '<Any aria-labelledby={`${"hoge"} ${fuga}`} />', errors: [{ message: ERROR_MESSAGE }] },
  ]
})
