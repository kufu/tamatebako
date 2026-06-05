const rule = require('../rules/best-practice-for-no-unnecessary-variable')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
})

ruleTester.run('best-practice-for-no-unnecessary-variable (TypeScript)', rule, {
  valid: [
    // TSAsExpression（Complexity 1）+ console.log（Complexity 2）= 3、maxComplexity: 2で除外
    {
      code: `
        const input = element as HTMLInputElement
        console.log(input)
      `,
      options: [{ maxComplexity: 2 }],
    },
    // TSAsExpression with MemberExpression（Complexity 2）+ console.log（Complexity 2）= 4、maxComplexity: 3で除外
    {
      code: `
        const input = element.value as string
        console.log(input)
      `,
      options: [{ maxComplexity: 3 }],
    },
  ],
  invalid: [
    // TSAsExpression（Complexity 1）をreturn文で使用（括弧が必要）
    {
      code: `
        function getInput() {
          const input = element as HTMLInputElement
          return input
        }
      `,
      output: `
        function getInput() {
          return (element as HTMLInputElement)
        }
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'input' },
        },
      ],
    },
    // TSAsExpression with MemberExpression（Complexity 2）をreturn文で使用（括弧が必要）
    {
      code: `
        function getValue() {
          const value = element.value as string
          return value
        }
      `,
      output: `
        function getValue() {
          return (element.value as string)
        }
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'value' },
        },
      ],
    },
  ],
})
