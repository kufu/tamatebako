const rule = require('../rules/autofixer-smarthr-ui-migration/index.js')
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

ruleTester.run('v90-to-v91-unknown-attributes', rule, {
  valid: [],
  invalid: [
    // ResponseMessageに未知の属性がある場合は自動修正なし
    {
      code: `<Heading><ResponseMessage id="foo" status="success">Xxxx</ResponseMessage></Heading>`,
      output: null, // 自動修正なし
      options: [{ from: '90', to: '91' }],
      errors: [{ messageId: 'migrateResponseMessageWithUnknownAttrs' }],
    },
    {
      code: `<Heading><ResponseMessage id="foo" onClick={handler} status="success" iconGap={0.5}>Xxxx</ResponseMessage></Heading>`,
      output: null, // 自動修正なし
      options: [{ from: '90', to: '91' }],
      errors: [{ messageId: 'migrateResponseMessageWithUnknownAttrs' }],
    },
    {
      code: `<FormControl label={<ResponseMessage id="foo" status="info">Xxxx</ResponseMessage>} />`,
      output: null, // 自動修正なし
      options: [{ from: '90', to: '91' }],
      errors: [{ messageId: 'migrateResponseMessageWithUnknownAttrs' }],
    },
    {
      code: `<Fieldset legend={<ResponseMessage data-testid="test" status="warning" iconGap={0.5}>Xxxx</ResponseMessage>} />`,
      output: null, // 自動修正なし
      options: [{ from: '90', to: '91' }],
      errors: [{ messageId: 'migrateResponseMessageWithUnknownAttrs' }],
    },
    // 未知の属性がない場合は自動修正される
    {
      code: `<Heading><ResponseMessage status="success">Xxxx</ResponseMessage></Heading>`,
      output: `<Heading icon={{ prefix: <FaCircleCheckIcon /> }}>Xxxx</Heading>`,
      options: [{ from: '90', to: '91' }],
      errors: [{ messageId: 'migrateResponseMessage' }],
    },
    {
      code: `<Heading><ResponseMessage status="success" iconGap={0.5}>Xxxx</ResponseMessage></Heading>`,
      output: `<Heading icon={{ prefix: <FaCircleCheckIcon />, gap: 0.5 }}>Xxxx</Heading>`,
      options: [{ from: '90', to: '91' }],
      errors: [{ messageId: 'removeIconGap' }],
    },
  ]
})
