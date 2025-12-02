const rule = require('../rules/a11y-prohibit-checkbox-or-radio-in-table-cell')

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

ruleTester.run('a11y-prohibit-checkbox-or-radio-in-table-cell', rule, {
  valid: [
    '<TdCheckbox />',
    '<ThCheckbox />',
    '<TdRadioButton />',
    '<Td>hello</Td>',
    '<Th>hello</Th>',
    `
    <Td>
      <Checkbox>
        可視ラベル
      </Checkbox>
    </Td>
    `,
  ],
  invalid: [
    {
      code: `<Td><Checkbox /></Td>`,
      errors: [{ message: 'Td の子孫に Checkbox を置くことはできません。代わりに TdCheckbox を使用してください。' }],
    },
    {
      code: `<Th><Checkbox /></Th>`,
      errors: [{ message: 'Th の子孫に Checkbox を置くことはできません。代わりに ThCheckbox を使用してください。' }],
    },
    {
      code: `<Th><Checkbox id="my-checkbox" name="agree" error /></Th>`,
      errors: [{ message: 'Th の子孫に Checkbox を置くことはできません。代わりに ThCheckbox を使用してください。' }],
    },
    {
      code: `<Td><RadioButton /></Td>`,
      errors: [{ message: 'Td の子孫に RadioButton を置くことはできません。代わりに TdRadioButton を使用してください。' }],
    },

    {
      code: `<Td><div><div><Checkbox /></div></div></Td>`,
      errors: [{ message: 'Td の子孫に Checkbox を置くことはできません。代わりに TdCheckbox を使用してください。' }],
    },
    {
      code: `<Td><><><Checkbox /></></></Td>`,
      errors: [{ message: 'Td の子孫に Checkbox を置くことはできません。代わりに TdCheckbox を使用してください。' }],
    },

    {
      code: `<CustomTd><CustomCheckbox /></CustomTd>`,
      errors: [{ message: 'Td の子孫に Checkbox を置くことはできません。代わりに TdCheckbox を使用してください。' }],
    },
    {
      code: `<CustomTh><CustomCheckbox /></CustomTh>`,
      errors: [{ message: 'Th の子孫に Checkbox を置くことはできません。代わりに ThCheckbox を使用してください。' }],
    },
    {
      code: `<CustomTd><CustomRadioButton /></CustomTd>`,
      errors: [{ message: 'Td の子孫に RadioButton を置くことはできません。代わりに TdRadioButton を使用してください。' }],
    },
    {
      name: "https://smarthr.atlassian.net/browse/A11Y2-23",
      code: `
        <CheckTd onClick={() => toggleChecked(crewEvaluation.id)}>
          <CheckBox
            name="checkEvaluation"
            checked={checked}
            onChange={() => toggleChecked(crewEvaluation.id)}
          />
        </CheckTd> 
      `,
      errors: [{ message: 'Td の子孫に Checkbox を置くことはできません。代わりに TdCheckbox を使用してください。' }],
    }
  ],
})
