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
      code: 'const x = a + b * c',
    },
    // 2回以上使用
    {
      code: `
        const x = obj.property
        console.log(x)
        console.log(x)
      `,
    },
    // var宣言は除外
    {
      code: `
        var x = array[index]
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
        x = condition ? a : b
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
        const x = a + b
        for (let i = 0; i < 10; i++) {
          console.log(x)
        }
      `,
    },
    {
      code: `
        const x = obj?.method()
        while (condition) {
          console.log(x)
        }
      `,
    },
    // 関数スコープ内で使用される変数は除外
    {
      code: `
        const x = data.filter(Boolean)
        array.forEach(() => {
          console.log(x)
        })
      `,
    },
    {
      code: `
        const x = 'constant'
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
    // 2回以上使用（演算式）
    {
      code: `
        const sum = a + b + c
        console.log(sum)
        doSomething(sum)
      `,
    },
    // 2回以上使用（配列アクセス）
    {
      code: `
        const first = items[0]
        doSomething(first)
        process(first)
      `,
    },
  ],
  invalid: [
    // 基本パターン
    {
      code: `
        const x = a + b * c
        console.log(x)
      `,
      output: `
        console.log(a + b * c)
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
          const x = array[0]
          return x
        }
      `,
      output: `
        function foo() {
          return array[0]
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
        const x = condition ? value1 : value2
        doSomething(x)
      `,
      output: `
        doSomething(condition ? value1 : value2)
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
          const x = obj.property
          console.log(x)
        }
      `,
      output: `
        if (condition) {
          console.log(obj.property)
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
    // リテラル値
    {
      code: `
        const value = 42
        console.log(value)
      `,
      output: `
        console.log(42)
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'value' },
        },
      ],
    },
    // オプショナルチェーン
    {
      code: `
        const data = obj?.nested?.property
        process(data)
      `,
      output: `
        process(obj?.nested?.property)
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'data' },
        },
      ],
    },
    // 複数の変数宣言（最初のdeclaratorのみが1回使用）
    {
      code: `
        const x = getValue(), y = getOther()
        console.log(x)
        console.log(y)
        console.log(y)
      `,
      output: `
        const y = getOther()
        console.log(getValue())
        console.log(y)
        console.log(y)
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'x' },
        },
      ],
    },
    // 複数の変数宣言（2番目のdeclaratorのみが1回使用）
    {
      code: `
        const x = getValue(), y = getOther()
        console.log(x)
        console.log(x)
        console.log(y)
      `,
      output: `
        const x = getValue()
        console.log(x)
        console.log(x)
        console.log(getOther())
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'y' },
        },
      ],
    },
    // if条件内で使用
    {
      code: `
        const value = getValue()
        if (value) {
          doSomething()
        }
      `,
      output: `
        if (getValue()) {
          doSomething()
        }
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'value' },
        },
      ],
    },
    // 別の変数の初期化で使用
    {
      code: `
        const x = getValue()
        const y = x + 1
      `,
      output: `
        const y = getValue() + 1
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'x' },
        },
      ],
    },
    // 配列リテラル内で使用
    {
      code: `
        const value = getValue()
        const arr = [1, value, 3]
      `,
      output: `
        const arr = [1, getValue(), 3]
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'value' },
        },
      ],
    },
    // オブジェクトリテラル内で使用
    {
      code: `
        const value = getValue()
        const obj = { key: value }
      `,
      output: `
        const obj = { key: getValue() }
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'value' },
        },
      ],
    },
    // テンプレートリテラル内で使用
    {
      code: `
        const name = getName()
        const message = \`Hello, \${name}!\`
      `,
      output: `
        const message = \`Hello, \${getName()}!\`
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'name' },
        },
      ],
    },
    // switch文の条件で使用
    {
      code: `
        const value = getValue()
        switch (value) {
          case 'a':
            break
        }
      `,
      output: `
        switch (getValue()) {
          case 'a':
            break
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
