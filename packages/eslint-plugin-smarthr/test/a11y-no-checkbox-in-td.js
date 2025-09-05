const rule = require('../rules/a11y-no-checkbox-in-td')

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

const generateErrorText = (cell, component, preferred) => `${cell} の子孫に ${component} を置くことはできません。代わりに、 ${preferred} を使用してください。`

ruleTester.run('a11y-no-checkbox-in-td', rule, {
  valid: [
    { code: `<TdCheckbox />` },
    { code: `<ThCheckbox />` },
    { code: `<TdRadioButton />` },
    { code: `<Td>hello</Td>` },
    { code: `<Th>hello</Th>` },
  ],
  invalid: [
    { code: `<Td><Checkbox /></Td>`, errors: [{ message: generateErrorText('Td', 'Checkbox', 'TdCheckbox') }] },
    { code: `<Th><Checkbox /></Th>`, errors: [{ message: generateErrorText('Th', 'Checkbox', 'ThCheckbox') }], output: `<ThCheckbox />` },
    { code: `<Th><Checkbox name="agree" /></Th>`, errors: [{ message: generateErrorText('Th', 'Checkbox', 'ThCheckbox') }], output: `<ThCheckbox name="agree" />` },
    { code: `<Td><RadioButton /></Td>`, errors: [{ message: generateErrorText('Td', 'RadioButton', 'TdRadioButton') }] },
    { code: `<Td><div><div><Checkbox /></div></div></Td>`, errors: [{ message: generateErrorText('Td', 'Checkbox', 'TdCheckbox') }] },
  ]
})
