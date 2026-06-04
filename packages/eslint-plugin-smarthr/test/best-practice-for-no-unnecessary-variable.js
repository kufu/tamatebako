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
    // 関数スコープ内で宣言・使用（同じスコープ内で2回以上使用）
    {
      code: `
        array.map(() => {
          const x = getValue()
          const y = getOther()
          return x + y + x + y
        })
      `,
    },
    // return文以外：複雑な式は除外（デフォルトmaxComplexity: 3）
    {
      code: `
        function foo() {
          const result = obj.method().another().property
          console.log(result)
        }
      `,
    },
    // return文：複雑さ以外の除外条件（await）は依然として適用
    {
      code: `
        async function foo() {
          const result = await fetchData()
          return result
        }
      `,
    },
    // maxComplexity: 2 の場合、Complexity 3は除外
    {
      code: `
        const x = obj.method().property
        console.log(x)
      `,
      options: [{ maxComplexity: 2 }],
    },
    // maxComplexity: 0 の場合、全て除外
    {
      code: `
        const x = getValue()
        console.log(x)
      `,
      options: [{ maxComplexity: 0 }],
    },
    // ネストした三項演算子（Complexity 4）はデフォルトで除外
    {
      code: `
        const x = a ? (b ? c : d) : e
        console.log(x)
      `,
    },
    // 両側にネストした三項演算子（Complexity 6）はデフォルトで除外
    {
      code: `
        const x = a ? (b ? c : d) : (e ? f : g)
        console.log(x)
      `,
    },
    // ObjectExpression（Complexity 2）+ console.log（Complexity 2）= 4、maxComplexity: 3で除外
    {
      code: `
        const obj = { a: 1, b: 2 }
        console.log(obj)
      `,
      options: [{ maxComplexity: 3 }],
    },
    // ArrayExpression（Complexity 2）+ console.log（Complexity 2）= 4、maxComplexity: 3で除外
    {
      code: `
        const arr = [1, 2, 3]
        console.log(arr)
      `,
      options: [{ maxComplexity: 3 }],
    },
    // SpreadElement（Complexity 1）を含むObjectExpression（Complexity 2）+ console.log（Complexity 2）= 5、maxComplexity: 3で除外
    {
      code: `
        const obj = { ...spread, a: 1 }
        console.log(obj)
      `,
      options: [{ maxComplexity: 3 }],
    },
    // export宣言された変数は除外
    {
      code: `
        export const messages = { a: 1, b: 2 }
        const locale = typeof messages
      `,
    },
    // ArrowFunctionExpression（Complexity 2）を含む式、デフォルトで除外
    {
      code: `
        const result = array.map(() => getValue())
        console.log(result)
      `,
    },
    // FunctionExpression（Complexity 2）を含む式、デフォルトで除外
    {
      code: `
        const result = array.map(function() { return getValue() })
        console.log(result)
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
    // 関数呼び出しの引数として使用（三項演算子は括弧で囲む）
    {
      code: `
        const x = condition ? value1 : value2
        doSomething(x)
      `,
      output: `
        doSomething((condition ? value1 : value2))
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
    // 関数スコープ内で宣言・使用（同じスコープ内）
    {
      code: `
        array.map(() => {
          const x = getValue()
          return x
        })
      `,
      output: `
        array.map(() => {
          return getValue()
        })
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'x' },
        },
      ],
    },
    // new式（括弧が必要）
    {
      code: `
        const instance = new MyClass()
        console.log(instance.property)
      `,
      output: `
        console.log((new MyClass()).property)
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'instance' },
        },
      ],
    },
    // 三項演算子（括弧が必要）
    {
      code: `
        const result = condition ? value1 : value2
        const y = result.property
      `,
      output: `
        const y = (condition ? value1 : value2).property
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'result' },
        },
      ],
    },
    // return文：複雑でもインライン化
    {
      code: `
        function foo() {
          const result = obj.method().another().property
          return result
        }
      `,
      output: `
        function foo() {
          return obj.method().another().property
        }
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'result' },
        },
      ],
    },
    // maxComplexity: 5 の場合、Complexity 3はインライン化
    {
      code: `
        const x = obj.method().property
        console.log(x)
      `,
      options: [{ maxComplexity: 5 }],
      output: `
        console.log(obj.method().property)
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'x' },
        },
      ],
    },
    // LogicalExpression（Complexity 1）
    {
      code: `
        const x = a && b
        console.log(x)
      `,
      output: `
        console.log(a && b)
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'x' },
        },
      ],
    },
    // ConditionalExpression（Complexity 2、括弧が必要）
    {
      code: `
        const x = a ? b : c
        console.log(x)
      `,
      output: `
        console.log((a ? b : c))
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'x' },
        },
      ],
    },
    // return文：複雑でもインライン化（アロー関数）
    {
      code: `
        const getValue = () => {
          const result = obj.method().another().property
          return result
        }
      `,
      output: `
        const getValue = () => {
          return obj.method().another().property
        }
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'result' },
        },
      ],
    },
    // ネストした三項演算子（Complexity 4）、maxComplexity: 7 ならインライン化
    {
      code: `
        const x = a ? (b ? c : d) : e
        console.log(x)
      `,
      options: [{ maxComplexity: 7 }],
      output: `
        console.log((a ? (b ? c : d) : e))
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'x' },
        },
      ],
    },
    // return文：ネストした三項演算子でもインライン化（括弧が必要）
    {
      code: `
        function foo() {
          const x = a ? (b ? c : d) : e
          return x
        }
      `,
      output: `
        function foo() {
          return (a ? (b ? c : d) : e)
        }
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'x' },
        },
      ],
    },
    // ObjectExpression（Complexity 2）をreturn文で使用（return文は括弧が必要）
    {
      code: `
        function foo() {
          const obj = { a: 1, b: 2 }
          return obj
        }
      `,
      output: `
        function foo() {
          return ({ a: 1, b: 2 })
        }
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'obj' },
        },
      ],
    },
    // ArrayExpression（Complexity 2）をreturn文で使用
    {
      code: `
        function foo() {
          const arr = [1, 2, 3]
          return arr
        }
      `,
      output: `
        function foo() {
          return [1, 2, 3]
        }
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'arr' },
        },
      ],
    },
    // SpreadElementを含むObjectExpression（Complexity 3）をreturn文で使用
    {
      code: `
        function foo() {
          const obj = { ...spread, a: 1 }
          return obj
        }
      `,
      output: `
        function foo() {
          return ({ ...spread, a: 1 })
        }
      `,
      errors: [
        {
          messageId: 'inlineVariable',
          data: { name: 'obj' },
        },
      ],
    },
    // ArrowFunctionExpression（Complexity 2）を含む式をreturn文で使用
    {
      code: `
        function foo() {
          const result = array.map(() => getValue())
          return result
        }
      `,
      output: `
        function foo() {
          return array.map(() => getValue())
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
