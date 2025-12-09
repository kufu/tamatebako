const rule = require('../rules/best-practice-for-data-test-attribute')
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
const ERROR_MESSAGE = `テストしたい要素を指定するためにテスト用の属性は利用せず、他の方法を検討してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-data-test-attribute
 - 方法1: click_link, click_button等を利用することで、テスト環境に準じた方法で要素を指定することを検討してください
   - 参考(Testing Library): https://testing-library.com/docs/queries/about
   - 参考(Capybara): https://rubydoc.info/github/jnicklas/capybara/Capybara/Node/Finders
 - 方法2: テスト環境のメソッド等で要素が指定できない場合はrole、name、aria系などユーザーが認識できる属性を利用した方法で要素を指定することを検討してください
   - 画像の場合、alt属性が利用できます
   - id, class属性は基本的にユーザーが認識出来ないため利用しないでください`


ruleTester.run('best-practice-for-data-test-attribute', rule, {
  valid: [
    { code: '<Any>ほげ</Any>'},
    { code: '<Any name="hoge">ほげ</Any>'},
    { code: '<Any data-any="fuga">ほげ</Any>'},
  ],
  invalid: [
    { code: '<Any data-spec="hijklmn">ほげ</Any>', errors: [{message: ERROR_MESSAGE}] },
    { code: '<Any data-spec>ほげ</Any>', errors: [{message: ERROR_MESSAGE}] },
    { code: '<Any data-testid="abcdefg">ほげ</Any>', errors: [{message: ERROR_MESSAGE}] },
    { code: '<Any data-testid>ほげ</Any>', errors: [{message: ERROR_MESSAGE}] },
  ]
})
