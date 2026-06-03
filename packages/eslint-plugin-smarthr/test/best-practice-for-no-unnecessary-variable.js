const rule = require('../rules/best-practice-for-no-unnecessary-variable')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
})

ruleTester.run('best-practice-for-no-unnecessary-variable', rule, {
  valid: [
    // 使用箇所がない
    {
      code: 'const x = getValue()',
    },
    // 2回以上使用
    {
      code: `
        const x = getValue()
        console.log(x)
        console.log(x)
      `,
    },
    // var宣言は除外
    {
      code: `
        var x = getValue()
        console.log(x)
      `,
    },
    // 分割代入は除外
    {
      code: `
        const [x] = array
        console.log(x)
      `,
    },
    {
      code: `
        const { name } = user
        console.log(name)
      `,
    },
    // 初期化なしは除外
    {
      code: `
        let x
        x = getValue()
        console.log(x)
      `,
    },
    // ループ変数は除外
    {
      code: `
        for (const item of items) {
          console.log(item)
        }
      `,
    },
    // ループ内で使用される変数は除外
    {
      code: `
        const x = getValue()
        for (let i = 0; i < 10; i++) {
          console.log(x)
        }
      `,
    },
    {
      code: `
        const x = getValue()
        while (condition) {
          console.log(x)
        }
      `,
    },
    // 関数スコープ内で使用される変数は除外
    {
      code: `
        const x = getValue()
        array.forEach(() => {
          console.log(x)
        })
      `,
    },
    {
      code: `
        const x = getValue()
        const fn = () => console.log(x)
      `,
    },
    // React Hooks除外
    {
      code: `
        function Component() {
          const handleClick = useCallback(() => {
            console.log('clicked')
          }, [])
          return handleClick
        }
      `,
    },
    // await式除外
    {
      code: `
        async function fetchData() {
          const result = await fetchAPI()
          console.log(result)
        }
      `,
    },
  ],
  invalid: [
    // 基本パターン
    {
      code: `
        const x = getValue()
        console.log(x)
      `,
      output: `
        console.log(getValue())
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'x' },
        },
      ],
    },
    // return文で使用
    {
      code: `
        function foo() {
          const x = getValue()
          return x
        }
      `,
      output: `
        function foo() {
          return getValue()
        }
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'x' },
        },
      ],
    },
    // 関数呼び出しの引数として使用
    {
      code: `
        const x = getValue()
        doSomething(x)
      `,
      output: `
        doSomething(getValue())
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'x' },
        },
      ],
    },
    // if文内で使用（lazy-variable適用後を想定）
    {
      code: `
        if (condition) {
          const x = getValue()
          console.log(x)
        }
      `,
      output: `
        if (condition) {
          console.log(getValue())
        }
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'x' },
        },
      ],
    },
    // 複雑な式
    {
      code: `
        function foo() {
          const result = obj.method().property
          return result
        }
      `,
      output: `
        function foo() {
          return obj.method().property
        }
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'result' },
        },
      ],
    },
  ],
})
