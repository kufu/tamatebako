const rule = require('../rules/a11y-prohibit-sectioning-content-in-form')
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

const ERROR_MESSAGE = `とその内部に存在するHeadingをsmarthr-ui/Fieldsetに置き換えてください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-sectioning-content-in-form
 - もしくはform要素を利用していない場合、フォームを構成する入力要素郡すべてを一つのform要素で囲んでください
   - required属性、pattern属性など一部属性はform要素で囲まないと動作しません
   - 送信用ボタンのonClickをform要素のonSubmitに移動し、送信用ボタンのtype属性に "submit" を指定することでより適切にマークアップ出来ます
     - その際、onSubmitの動作中で "e.preventDefault()" と "e.stopPropagation()" を指定する必要がある場合があります。
 - form内の見出しとなる要素をlegend, labelのみに統一することでスクリーンリーダーのジャンプ機能などの利便性が向上します
 - smarthr-ui/Fieldset が利用できない場合、fieldset要素とlegend要素を使ったマークアップに修正してください
   - その際、fieldset要素の直下にlegend要素が存在するようにしてください。他要素がfieldsetとlegendの間に存在すると、正しく紐づけが行われない場合があります`

ruleTester.run('a11y-prohibit-sectioning-content-in-form', rule, {
  valid: [
    { code: `<div><article>content</article></div>`, filename: '/app/page.tsx' },
    { code: `<div><section>content</section></div>`, filename: '/app/page.tsx' },
    { code: `<div><aside>content</aside></div>`, filename: '/app/page.tsx' },
    { code: `<div><nav>content</nav></div>`, filename: '/app/page.tsx' },
    { code: `<form><Fieldset>content</Fieldset></form>`, filename: '/app/FormDialog/page.tsx' },
    { code: `<FormControl><Input /></FormControl>`, filename: '/app/page.tsx' },
    { code: `<SideNav>content</SideNav>`, filename: '/app/Form/page.tsx' },
    { code: `<IndexNav>content</IndexNav>`, filename: '/app/FormDialog/page.tsx' },
  ],
  invalid: [
    {
      code: `<form><article>content</article></form>`,
      filename: '/app/page.tsx',
      errors: [{ message: `article${ERROR_MESSAGE}` }]
    },
    {
      code: `<FormControl><section>content</section></FormControl>`,
      filename: '/app/Form/page.tsx',
      errors: [{ message: `section${ERROR_MESSAGE}` }]
    },
    {
      code: `<Fieldset><aside>content</aside></Fieldset>`,
      filename: '/app/FormDialog/page.tsx',
      errors: [{ message: `aside${ERROR_MESSAGE}` }]
    },
    {
      code: `<fieldset><nav>content</nav></fieldset>`,
      filename: '/app/Form/page.tsx',
      errors: [{ message: `nav${ERROR_MESSAGE}` }]
    },
    {
      code: `<article><FormControl><Input /></FormControl></article>`,
      filename: '/app/page.tsx',
      errors: [{ message: `article${ERROR_MESSAGE}` }]
    },
    {
      code: `<section><Fieldset>content</Fieldset></section>`,
      filename: '/app/page.tsx',
      errors: [{ message: `section${ERROR_MESSAGE}` }]
    },
  ]
})
