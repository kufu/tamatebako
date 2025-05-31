const rule = require('../rules/best-practice-for-nested-attributes-array-index')
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

const ERROR_MESSAGE = `入力要素の名称のうち、配列に当たる部分の連番を指定しない場合（例: a[xxx][][yyy] ）、配列内アイテムの属性が意図せず入れ替わってしまう場合がありえるため、常にindexを設定してください。
 - 例のyyyに当たる値が配列内の別アイテムに紐づいてしまう場合があります。
 - 詳しくは https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-nested-attributes-array-index を参照してください`

ruleTester.run('best-practice-for-nested-attributes-array-index', rule, {
  valid: [
    { code: `<Input name="a[xxxx][0][yyy]" />` },
    { code: '`<Input name="a[xxxx][${index}][yyy]" />`' },
    { code: `const hoge = 'a[xxxx][0][id]'`},
    { code: 'const hoge = `${prefix}[${index}][id]`'},
  ],
  invalid: [
    { code: `<Input name="a[xxxx][][yyy]" />`, errors: [ { message: ERROR_MESSAGE } ] },
    { code: '<Input name={`${any}[][yyy]`} />', errors: [ { message: ERROR_MESSAGE } ] },
    { code: `const hoge = 'a[xxxx][][id]'`, errors: [ { message: ERROR_MESSAGE } ] },
    { code: 'const hoge = `${prefix}[][id]`', errors: [ { message: ERROR_MESSAGE } ] },
  ]
})
