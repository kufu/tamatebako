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
    // 型注釈（Complexity 1）+ CallExpression（引数なしComplexity 0）+ console.log（Complexity 2）= 3、maxComplexity: 2で除外
    {
      code: `
        const value: string = getValue()
        console.log(value)
      `,
      options: [{ maxComplexity: 2 }],
    },
    // 型注釈（Complexity 1）+ MemberExpression（Complexity 1）+ console.log（Complexity 2）= 4、maxComplexity: 3で除外
    {
      code: `
        const value: number = obj.property
        console.log(value)
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
      options: [{ fix: true }],
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
      options: [{ fix: true }],
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'value' },
        },
      ],
    },
    // 型注釈付き変数をreturn文で使用（型注釈をasで保持）
    {
      code: `
        function getValue() {
          const value: string = getStringValue()
          return value
        }
      `,
      output: `
        function getValue() {
          return (getStringValue() as string)
        }
      `,
      options: [{ fix: true }],
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'value' },
        },
      ],
    },
    // 型注釈付き変数を通常の文で使用（型注釈をasで保持）
    {
      code: `
        const value: number = 123
        console.log(value)
      `,
      output: `
        console.log((123 as number))
      `,
      options: [{ fix: true }],
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'value' },
        },
      ],
    },
    // 型注釈付き変数（複雑な型）
    {
      code: `
        const user: User | null = getUser()
        console.log(user)
      `,
      output: `
        console.log((getUser() as User | null))
      `,
      options: [{ fix: true }],
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'user' },
        },
      ],
    },
    // 型注釈（Complexity 1）+ MemberExpression（Complexity 1）= 2、maxComplexity: 5なのでインライン化
    {
      code: `
        const value: string = obj.property
        console.log(value)
      `,
      output: `
        console.log((obj.property as string))
      `,
      options: [{ fix: true }],
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'value' },
        },
      ],
    },
    // 型注釈付き変数がExpressionStatementの先頭で使用される場合、セミコロンを前置
    {
      code: `
        doSomething()
        const value: string = getValue()
        value.toUpperCase()
      `,
      output: `
        doSomething()
        ;(getValue() as string).toUpperCase()
      `,
      options: [{ fix: true }],
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'value' },
        },
      ],
    },
    // 型注釈付き変数（メソッドチェーン）
    {
      code: `
        inputs[0].focus()
        const input: HTMLInputElement = inputs[0]
        input.setSelectionRange(0, 0)
      `,
      output: `
        inputs[0].focus()
        ;(inputs[0] as HTMLInputElement).setSelectionRange(0, 0)
      `,
      options: [{ fix: true }],
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'input' },
        },
      ],
    },
    // fix: false - 型注釈付き変数で自動修正なし
    {
      code: `
        const value: string = getValue()
        console.log(value)
      `,
      options: [{ fix: false }],
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'value' },
        },
      ],
    },
    // fix: true - 型注釈付き変数で自動修正あり
    {
      code: `
        const value: string = getValue()
        console.log(value)
      `,
      output: `
        console.log((getValue() as string))
      `,
      options: [{ fix: true }],
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'value' },
        },
      ],
    },
    // fix: true - TSAsExpressionで自動修正あり
    {
      code: `
        const input = element as HTMLInputElement
        return input
      `,
      output: `
        return (element as HTMLInputElement)
      `,
      options: [{ fix: true }],
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'input' },
        },
      ],
    },
  ],
})
