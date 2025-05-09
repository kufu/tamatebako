const rule = require('../rules/a11y-image-has-alt-attribute')
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
const messageNotExistAlt = `画像にはalt属性を指定してください。
 - コンポーネントが画像ではない場合、img or image を末尾に持たない名称に変更してください。
 - ボタンやリンクの先頭・末尾などに設置するアイコンとしての役割を持つ画像の場合、コンポーネント名の末尾を "Icon" に変更してください。
 - SVG component の場合、altを属性として受け取れるようにした上で '<svg role="img" aria-label={alt}>' のように指定してください。
 - 文字情報が多い場合や画像の前後の画像と同じ内容を設定したい場合などは aria-describedby属性を利用することもできます。
  - aria-describedby属性を利用する場合でもalt属性を併用することができます。`
const messageNullAlt = `画像の情報をテキストにした代替テキスト（'alt'）を設定してください。
 - 装飾目的の画像など、alt属性に指定すべき文字がない場合は背景画像にすることを検討してください。`

ruleTester.run('a11y-image-has-alt-attribute', rule, {
  valid: [
    { code: '<img alt="hoge" />' },
    { code: '<HogeImg alt="hoge" />' },
    { code: '<HogeImage alt="hoge" />' },
    { code: '<HogeIcon />' },
    { code: '<HogeImage aria-describedby="hoge" />' },
    { code: '<HogeImage aria-describedby="hoge" alt="fuga" />' },
    { code: '<svg><image /></svg>' },
    { code: '<AnyImg {...hoge} />', options: [{ checkType: 'allow-spread-attributes' }] },
  ],
  invalid: [
    { code: '<img />', errors: [ { message: messageNotExistAlt } ] },
    { code: '<HogeImage alt="" />', errors: [ { message: messageNullAlt } ] },
    { code: '<hoge><image /></hoge>', errors: [ { message: messageNotExistAlt } ] },
    { code: '<AnyImg {...hoge} />', errors: [ { message: messageNotExistAlt } ]  },
    { code: '<AnyImg {...hoge} />', options: [{ checkType: 'always' }], errors: [ { message: messageNotExistAlt } ] },
  ]
})
