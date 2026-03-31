const rule = require('../rules/best-practice-for-response-message')
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

const ERROR_MESSAGE = `ResponseMessageは見出しやラベルでは使用できません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-response-message
 - ResponseMessageはAPIの実行結果を表示する目的のコンポーネントであり、静的な見出しやラベル、アイコンの配置調整のためのコンポーネントではありません
 - 見出しやラベルにアイコンを表示したい場合は、smarthr-ui/Iconなど適切なコンポーネントを使用してください`

ruleTester.run('best-practice-for-response-message', rule, {
  valid: [
    // ResponseMessageを通常の場所で使用
    { code: `<div><ResponseMessage type="success">保存しました</ResponseMessage></div>` },
    { code: `<section><ResponseMessage type="error">エラーが発生しました</ResponseMessage></section>` },

    // Heading系にテキストのみ
    { code: `<Heading>見出し</Heading>` },
    { code: `<h1>ページタイトル</h1>` },
    { code: `<PageHeading>ページ見出し</PageHeading>` },

    // Heading系にIconを使用（ResponseMessageではない）
    { code: `<Heading><Icon name="info" />見出し</Heading>` },
    { code: `<h2><Icon name="check" />完了</h2>` },

    // FormControlのlabelにテキストのみ
    { code: `<FormControl label="名前" />` },
    { code: `<FormControl label={labelText} />` },

    // Fieldsetのlegendにテキストのみ
    { code: `<Fieldset legend="選択肢" />` },
    { code: `<Fieldset legend={legendText} />` },
  ],
  invalid: [
    // Heading系のchildren内にResponseMessage
    {
      code: `<Heading><ResponseMessage type="success">見出し</ResponseMessage></Heading>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<h1><ResponseMessage type="info">ページタイトル</ResponseMessage></h1>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<h2><ResponseMessage type="error">セクション見出し</ResponseMessage></h2>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<h3><ResponseMessage type="warning">サブセクション</ResponseMessage></h3>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<PageHeading><ResponseMessage type="success">ページ見出し</ResponseMessage></PageHeading>`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // Heading内に複数要素がある場合
    {
      code: `<Heading>テキスト<ResponseMessage type="info">メッセージ</ResponseMessage></Heading>`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // FormControlのlabel属性内にResponseMessage
    {
      code: `<FormControl label={<ResponseMessage type="success">ラベル</ResponseMessage>} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<FormControl label={<><ResponseMessage type="info">ラベル</ResponseMessage>説明</>} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // Fieldsetのlegend属性内にResponseMessage
    {
      code: `<Fieldset legend={<ResponseMessage type="success">凡例</ResponseMessage>} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<Fieldset legend={<><ResponseMessage type="warning">凡例</ResponseMessage>追加情報</>} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
  ]
})
