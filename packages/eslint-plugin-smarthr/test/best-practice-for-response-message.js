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
 - ResponseMessageはAPIの実行結果を表示する目的のコンポーネントです
 - 見出しやラベルにアイコンを表示したい場合は、Headingのicon属性、FormControlのlabel.icon属性、Fieldsetのlegend.icon属性、またはsmarthr-ui/Textを使用してください`

ruleTester.run('best-practice-for-response-message', rule, {
  valid: [
    // ResponseMessageを通常の場所で使用
    { code: `<div><ResponseMessage type="success">保存しました</ResponseMessage></div>` },
    { code: `<section><ResponseMessage type="error">エラーが発生しました</ResponseMessage></section>` },

    // 拡張ResponseMessageを通常の場所で使用
    { code: `<div><CustomResponseMessage type="success">保存しました</CustomResponseMessage></div>` },

    // Heading系にテキストのみ
    { code: `<Heading>見出し</Heading>` },
    { code: `<h1>ページタイトル</h1>` },
    { code: `<PageHeading>ページ見出し</PageHeading>` },

    // Heading系にicon属性を使用（ResponseMessageではない）
    { code: `<Heading icon={FaCheckIcon}>見出し</Heading>` },
    { code: `<PageHeading icon={FaInfoIcon}>ページ見出し</PageHeading>` },

    // 生のheading要素にTextを使用（ResponseMessageではない）
    { code: `<h1><Text icon={FaInfoIcon}>ページタイトル</Text></h1>` },
    { code: `<h2><Text icon={FaCheckIcon}>完了</Text></h2>` },

    // FormControlのlabelにテキストのみ
    { code: `<FormControl label="名前" />` },
    { code: `<FormControl label={labelText} />` },

    // FormControlのlabel.icon属性を使用（ResponseMessageではない）
    { code: `<FormControl label={{ text: '名前', icon: FaUserIcon }} />` },

    // Fieldsetのlegendにテキストのみ
    { code: `<Fieldset legend="選択肢" />` },
    { code: `<Fieldset legend={legendText} />` },

    // Fieldsetのlegend.icon属性を使用（ResponseMessageではない）
    { code: `<Fieldset legend={{ text: '選択肢', icon: FaInfoIcon }} />` },

    // 生のlabel要素にTextを使用（ResponseMessageではない）
    { code: `<label>名前</label>` },
    { code: `<label><Text icon={FaUserIcon}>名前</Text></label>` },

    // 生のlegend要素にTextを使用（ResponseMessageではない）
    { code: `<legend>選択肢</legend>` },
    { code: `<legend><Text icon={FaInfoIcon}>説明</Text></legend>` },
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

    // 拡張ResponseMessage（後方一致）
    {
      code: `<Heading><CustomResponseMessage type="success">見出し</CustomResponseMessage></Heading>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<h1><ExtendedResponseMessage type="info">タイトル</ExtendedResponseMessage></h1>`,
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
    {
      code: `<FormControl label={<CustomResponseMessage type="success">ラベル</CustomResponseMessage>} />`,
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
    {
      code: `<Fieldset legend={<CustomResponseMessage type="info">凡例</CustomResponseMessage>} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // label要素のchildren内にResponseMessage
    {
      code: `<label><ResponseMessage type="success">ラベル</ResponseMessage></label>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<label>テキスト<ResponseMessage type="info">ラベル</ResponseMessage></label>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<label><CustomResponseMessage type="success">ラベル</CustomResponseMessage></label>`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // legend要素のchildren内にResponseMessage
    {
      code: `<legend><ResponseMessage type="warning">凡例</ResponseMessage></legend>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<legend><ResponseMessage type="error">凡例</ResponseMessage>追加情報</legend>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<legend><CustomResponseMessage type="info">凡例</CustomResponseMessage></legend>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
  ]
})
