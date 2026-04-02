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
    { code: `<Heading>Xxxx</Heading>` },
    { code: `<h1>Hoge</h1>` },
    { code: `<PageHeading>Fuga</PageHeading>` },

    // Heading系にicon属性を使用（ResponseMessageではない）
    { code: `<Heading icon={<FaCircleCheckIcon />}>Xxxx</Heading>` },
    { code: `<PageHeading icon={<FaCircleInfoIcon />}>Hoge</PageHeading>` },

    // 生のheading要素にTextを使用（ResponseMessageではない）
    { code: `<h1><Text icon={<FaCircleInfoIcon />}>Hoge</Text></h1>` },
    { code: `<h2><Text icon={<WarningIcon />}>Fuga</Text></h2>` },

    // FormControlのlabelにテキストのみ
    { code: `<FormControl label="Foo" />` },
    { code: `<FormControl label={labelText} />` },

    // FormControlのlabel.icon属性を使用（ResponseMessageではない）
    { code: `<FormControl label={{ text: 'Foo', icon: <FaCircleCheckIcon /> }} />` },

    // Fieldsetのlegendにテキストのみ
    { code: `<Fieldset legend="Bar" />` },
    { code: `<Fieldset legend={legendText} />` },

    // Fieldsetのlegend.icon属性を使用（ResponseMessageではない）
    { code: `<Fieldset legend={{ text: 'Bar', icon: <WarningIcon /> }} />` },

    // 生のlabel要素にTextを使用（ResponseMessageではない）
    { code: `<label>Foo</label>` },
    { code: `<label><Text icon={<FaCircleInfoIcon />}>Foo</Text></label>` },

    // 生のlegend要素にTextを使用（ResponseMessageではない）
    { code: `<legend>Bar</legend>` },
    { code: `<legend><Text icon={<FaCircleExclamationIcon />}>Bar</Text></legend>` },
  ],
  invalid: [
    // Heading系のchildren内にResponseMessage
    {
      code: `<Heading><ResponseMessage type="success">Xxxx</ResponseMessage></Heading>`,
      output: `<Heading icon={{ prefix: <FaCircleCheckIcon /> }}>Xxxx</Heading>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<h1><ResponseMessage type="info">Hoge</ResponseMessage></h1>`,
      output: `<h1><Text icon={{ prefix: <FaCircleInfoIcon /> }}>Hoge</Text></h1>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<h2><ResponseMessage type="error">Fuga</ResponseMessage></h2>`,
      output: `<h2><Text icon={{ prefix: <FaCircleExclamationIcon /> }}>Fuga</Text></h2>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<h3><ResponseMessage type="warning">Piyo</ResponseMessage></h3>`,
      output: `<h3><Text icon={{ prefix: <WarningIcon /> }}>Piyo</Text></h3>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<PageHeading><ResponseMessage type="success">Hoge</ResponseMessage></PageHeading>`,
      output: `<PageHeading icon={{ prefix: <FaCircleCheckIcon /> }}>Hoge</PageHeading>`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // 拡張ResponseMessage（後方一致）
    {
      code: `<Heading><CustomResponseMessage type="success">Xxxx</CustomResponseMessage></Heading>`,
      output: `<Heading icon={{ prefix: <FaCircleCheckIcon /> }}>Xxxx</Heading>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<h1><ExtendedResponseMessage type="info">Hoge</ExtendedResponseMessage></h1>`,
      output: `<h1><Text icon={{ prefix: <FaCircleInfoIcon /> }}>Hoge</Text></h1>`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // Heading内に複数要素がある場合
    {
      code: `<Heading>Xxxx<ResponseMessage type="info">Hoge</ResponseMessage></Heading>`,
      output: `<Heading icon={{ prefix: <FaCircleInfoIcon /> }}>XxxxHoge</Heading>`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // 既にicon属性がある場合（自動修正なし）
    {
      code: `<Heading icon={<FaUserIcon />}><ResponseMessage type="success">Xxxx</ResponseMessage></Heading>`,
      output: null,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<FormControl label={{ text: <ResponseMessage type="info">Foo</ResponseMessage>, icon: <FaCircleInfoIcon /> }} />`,
      output: null,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // FormControlのlabel属性内にResponseMessage
    {
      code: `<FormControl label={<ResponseMessage type="success">Foo</ResponseMessage>} />`,
      output: `<FormControl label={{ text: Foo, icon: { prefix: <FaCircleCheckIcon /> } }} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<FormControl label={<><ResponseMessage type="info">Foo</ResponseMessage>Xxxx</>} />`,
      output: `<FormControl label={{ text: Foo, icon: { prefix: <FaCircleInfoIcon /> } }} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<FormControl label={<CustomResponseMessage type="success">Foo</CustomResponseMessage>} />`,
      output: `<FormControl label={{ text: Foo, icon: { prefix: <FaCircleCheckIcon /> } }} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // Fieldsetのlegend属性内にResponseMessage
    {
      code: `<Fieldset legend={<ResponseMessage type="success">Bar</ResponseMessage>} />`,
      output: `<Fieldset legend={{ text: Bar, icon: { prefix: <FaCircleCheckIcon /> } }} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<Fieldset legend={<><ResponseMessage type="warning">Bar</ResponseMessage>Hoge</>} />`,
      output: `<Fieldset legend={{ text: Bar, icon: { prefix: <WarningIcon /> } }} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<Fieldset legend={<CustomResponseMessage type="info">Bar</CustomResponseMessage>} />`,
      output: `<Fieldset legend={{ text: Bar, icon: { prefix: <FaCircleInfoIcon /> } }} />`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // label要素のchildren内にResponseMessage
    {
      code: `<label><ResponseMessage type="success">Foo</ResponseMessage></label>`,
      output: `<label><Text icon={{ prefix: <FaCircleCheckIcon /> }}>Foo</Text></label>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<label>Xxxx<ResponseMessage type="info">Foo</ResponseMessage></label>`,
      output: `<label>Xxxx<Text icon={{ prefix: <FaCircleInfoIcon /> }}>Foo</Text></label>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<label><CustomResponseMessage type="success">Foo</CustomResponseMessage></label>`,
      output: `<label><Text icon={{ prefix: <FaCircleCheckIcon /> }}>Foo</Text></label>`,
      errors: [{ message: ERROR_MESSAGE }]
    },

    // legend要素のchildren内にResponseMessage
    {
      code: `<legend><ResponseMessage type="warning">Bar</ResponseMessage></legend>`,
      output: `<legend><Text icon={{ prefix: <WarningIcon /> }}>Bar</Text></legend>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<legend><ResponseMessage type="error">Bar</ResponseMessage>Hoge</legend>`,
      output: `<legend><Text icon={{ prefix: <FaCircleExclamationIcon /> }}>Bar</Text>Hoge</legend>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<legend><CustomResponseMessage type="info">Bar</CustomResponseMessage></legend>`,
      output: `<legend><Text icon={{ prefix: <FaCircleInfoIcon /> }}>Bar</Text></legend>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
  ]
})
