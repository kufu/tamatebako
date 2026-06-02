const rule = require('../rules/best-practice-for-lazy-variable')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
})

ruleTester.run('best-practice-for-lazy-variable', rule, {
  valid: [
    // 使用箇所がない
    {
      code: 'const x = getValue()',
    },
    // if文がない
    {
      code: `
        const x = getValue()
        console.log(x)
      `,
    },
    // 2回以上使用
    {
      code: `
        const x = getValue()
        someCode()
        if (condition) {
          console.log(x)
        }
        console.log(x)
      `,
    },
    // 関数スコープ内で使用（forEach）
    {
      code: `
        const x = getValue()
        someCode()
        if (condition) {
          array.forEach(() => {
            console.log(x)
          })
        }
      `,
    },
    // 関数スコープ内で使用（アロー関数）
    {
      code: `
        const x = getValue()
        someCode()
        if (condition) {
          const fn = () => console.log(x)
        }
      `,
    },
    // forループ内で使用（ifなし） - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        for (let i = 0; i < 10; i++) {
          console.log(x)
        }
      `,
    },
    // whileループ内で使用（ifなし） - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        while (condition) {
          console.log(x)
        }
      `,
    },
    // do-whileループ内で使用（ifなし） - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        do {
          console.log(x)
        } while (condition)
      `,
    },
    // for-inループ内で使用（ifなし） - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        for (const key in obj) {
          console.log(x)
        }
      `,
    },
    // for-ofループ内で使用（ifなし） - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        for (const item of array) {
          console.log(x)
        }
      `,
    },
    // for > if - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        for (let i = 0; i < 10; i++) {
          if (condition) {
            console.log(x)
          }
        }
      `,
    },
    // for > switch - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        for (let i = 0; i < 10; i++) {
          switch (condition) {
            case 'a':
              console.log(x)
              break
          }
        }
      `,
    },
    // while > switch - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        while (condition) {
          switch (check) {
            case 'a':
              console.log(x)
              break
          }
        }
      `,
    },
    // for > for - 対象外（ネストしたループ）
    {
      code: `
        const x = getValue()
        someCode()
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            console.log(x)
          }
        }
      `,
    },
    // for > for > if - 対象外（ループの中のループの中のif）
    {
      code: `
        const x = getValue()
        someCode()
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            if (condition) {
              console.log(x)
            }
          }
        }
      `,
    },
    // if > for - 対象外（ループを超える）
    {
      code: `
        const x = getValue()
        someCode()
        if (condition) {
          for (let i = 0; i < 10; i++) {
            console.log(x)
          }
        }
      `,
    },
    // switch > for - 対象外（ループを超える）
    {
      code: `
        const x = getValue()
        someCode()
        switch (condition) {
          case 'a':
            for (let i = 0; i < 10; i++) {
              console.log(x)
            }
            break
        }
      `,
    },
    // switch文のdiscriminant（条件部分）で使用 - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        switch (x) {
          case 'a':
            console.log('matched')
            break
        }
      `,
    },
    // switch文で複数caseで使用 - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        switch (condition) {
          case 'a':
            console.log(x)
            break
          case 'b':
            console.log(x)
            break
        }
      `,
    },
    // switch文のcase内で関数スコープ使用 - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        switch (condition) {
          case 'a':
            array.forEach(() => {
              console.log(x)
            })
            break
        }
      `,
    },
    // 三項演算子 - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        const y = condition ? x : 0
      `,
    },
    // 論理演算子 - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        const y = condition && x
      `,
    },
    // while内のif - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        while (condition) {
          if (check) {
            console.log(x)
          }
        }
      `,
    },
    // do-while内のif - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        do {
          if (check) {
            console.log(x)
          }
        } while (condition)
      `,
    },
    // for-in内のif - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        for (const key in obj) {
          if (check) {
            console.log(x)
          }
        }
      `,
    },
    // for-of内のif - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        for (const item of array) {
          if (check) {
            console.log(x)
          }
        }
      `,
    },
    // ネストした条件文の途中に関数スコープ - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        if (condition1) {
          function helper() {
            if (condition2) {
              console.log(x)
            }
          }
        }
      `,
    },
    // ネストした条件文の途中にループ - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        if (condition1) {
          for (let i = 0; i < 10; i++) {
            if (condition2) {
              console.log(x)
            }
          }
        }
      `,
    },
    // var宣言 - 対象外
    {
      code: `
        var x = getValue()
        someCode()
        if (condition) {
          console.log(x)
        }
      `,
    },
    // if条件部分とbody両方で使用 - 対象外（2回使用）
    {
      code: `
        const x = getValue()
        someCode()
        if (x > 10) {
          console.log(x)
        }
      `,
    },
    // 深いネスト（3階層）で途中にループ - 対象外
    {
      code: `
        const x = getValue()
        someCode()
        if (condition1) {
          for (let i = 0; i < 10; i++) {
            if (condition2) {
              if (condition3) {
                console.log(x)
              }
            }
          }
        }
      `,
    },
    // return前に使用（条件部分で使用）
    {
      code: `
        function test() {
          const data = getData()
          if (!data.isValid) {
            return
          }
          console.log(data)
        }
      `,
    },
    // try-finally内でdataを使う
    {
      code: `
        function test() {
          const data = getData()
          try {
            if (condition) {
              return
            }
            console.log('other')
          } finally {
            cleanup(data)
          }
          console.log(data)
        }
      `,
    },
    // try-catch内でdataを使う
    {
      code: `
        const data = getData()
        try {
          if (condition) {
            throw new Error('error')
          }
          console.log(data)
        } catch (e) {
          console.log('caught')
        }
        console.log(data)
      `,
    },
    // catch内でdataを使う + 外でも使う
    {
      code: `
        const data = getData()
        try {
          someCode()
        } catch (e) {
          console.error('error:', data)
          throw e
        }
        console.log(data)
      `,
    },
    // React Hooks（useCallback）は移動対象外
    {
      code: `
        function Component() {
          const handleClick = useCallback(() => {
            console.log('clicked')
          }, [])
          if (!condition) {
            return null
          }
          console.log(handleClick)
        }
      `,
    },
    // React Hooks（useState）は移動対象外
    {
      code: `
        function Component() {
          const [count, setCount] = useState(0)
          if (condition) {
            console.log(count)
          }
        }
      `,
    },
    // React Hooks（useMemo）は移動対象外
    {
      code: `
        function Component() {
          const value = useMemo(() => calculate(), [deps])
          if (!condition) {
            return null
          }
          console.log(value)
        }
      `,
    },
    // React Hooks（useEffect）は移動対象外
    {
      code: `
        function Component() {
          const cleanup = useEffect(() => {
            return () => console.log('cleanup')
          }, [])
          if (condition) {
            console.log(cleanup)
          }
        }
      `,
    },
    // await式を含む変数は移動対象外
    {
      code: `
        async function test() {
          const data = await fetchData()
          if (!condition) {
            return
          }
          console.log(data)
        }
      `,
    },
    // await式を含む変数は移動対象外（条件分岐内）
    {
      code: `
        async function test() {
          const data = await fetchData()
          if (condition) {
            console.log(data)
          }
        }
      `,
    },
    // await式を含む変数は移動対象外（switch内）
    {
      code: `
        async function test() {
          const data = await fetchData()
          switch (type) {
            case 'a':
              console.log(data)
              break
          }
        }
      `,
    },
  ],
  invalid: [
    // ネストした早期return
    {
      code: `
        function test() {
          const data = getData()
          if (condition1) {
            if (condition2) {
              return
            }
            console.log('branch')
          }
          console.log(data)
        }
      `,
      output: `
        function test() {
          if (condition1) {
            if (condition2) {
              return
            }
            console.log('branch')
          }
          const data = getData()
          console.log(data)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'data' },
        },
      ],
    },
    // 基本: if body内で1回使用、間にコードあり
    {
      code: `
        const x = getValue()
        someCode()
        if (condition) {
          console.log(x)
        }
      `,
      output: `
        someCode()
        if (condition) {
          const x = getValue()
          console.log(x)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // else内で使用
    {
      code: `
        const x = getValue()
        someCode()
        if (condition) {
          console.log("other")
        } else {
          console.log(x)
        }
      `,
      output: `
        someCode()
        if (condition) {
          console.log("other")
        } else {
          const x = getValue()
          console.log(x)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // else if内で使用
    {
      code: `
        const x = getValue()
        someCode()
        if (condition1) {
          console.log("a")
        } else if (condition2) {
          console.log(x)
        }
      `,
      output: `
        someCode()
        if (condition1) {
          console.log("a")
        } else if (condition2) {
          const x = getValue()
          console.log(x)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // ブロックなしif（ブロック追加）
    {
      code: `
        const x = getValue()
        someCode()
        if (condition) console.log(x)
      `,
      output: `
        someCode()
        if (condition) {
const x = getValue()
console.log(x)
}
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // 間に複数のコード
    {
      code: `
        const x = getValue()
        code1()
        code2()
        code3()
        if (condition) {
          console.log(x)
        }
      `,
      output: `
        code1()
        code2()
        code3()
        if (condition) {
          const x = getValue()
          console.log(x)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // if直前（間にコードなし）- body内で使用なので移動
    {
      code: `
        const x = getValue()
        if (condition) {
          console.log(x)
        }
      `,
      output: `
        if (condition) {
          const x = getValue()
          console.log(x)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // else内で使用（間にコードなし）
    {
      code: `
        const x = getValue()
        if (condition) {
          console.log("other")
        } else {
          console.log(x)
        }
      `,
      output: `
        if (condition) {
          console.log("other")
        } else {
          const x = getValue()
          console.log(x)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // else if直前（間にコードなし）
    {
      code: `
        const x = getValue()
        if (condition1) {
          console.log("a")
        } else if (condition2) {
          console.log(x)
        }
      `,
      output: `
        if (condition1) {
          console.log("a")
        } else if (condition2) {
          const x = getValue()
          console.log(x)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // switch case内で使用（block無し → blockを追加）
    {
      code: `const x = getValue()
someCode()
switch (condition) {
  case 'a':
    console.log(x)
    break
}`,
      output: `someCode()
switch (condition) {
  case 'a': {
    const x = getValue()
    console.log(x)
    break
  }
}`,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // switch case内で使用（block無し、間にコードなし → blockを追加）
    {
      code: `const x = getValue()
switch (condition) {
  case 'a':
    console.log(x)
    break
}`,
      output: `switch (condition) {
  case 'a': {
    const x = getValue()
    console.log(x)
    break
  }
}`,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // switch default内で使用（block無し → blockを追加）
    {
      code: `
        const x = getValue()
        someCode()
        switch (condition) {
          case 'a':
            console.log('a')
            break
          default:
            console.log(x)
            break
        }
      `,
      output: `
        someCode()
        switch (condition) {
          case 'a':
            console.log('a')
            break
          default: {
            const x = getValue()
            console.log(x)
            break
          }
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // switch文の複数case（fallthrough）で既にblockがある場合
    {
      code: `
        const response = getResponse()
        const serverError = response.data
        clearErrors()
        switch (response.status) {
          case 400:
          case 404: {
            if (serverError.code === 'ERROR') {
              console.log(serverError.message)
            }
            if (serverError.detail) {
              console.log(serverError.detail)
            }
            break
          }
        }
      `,
      output: `
        const response = getResponse()
        clearErrors()
        switch (response.status) {
          case 400:
          case 404: {
            const serverError = response.data
            if (serverError.code === 'ERROR') {
              console.log(serverError.message)
            }
            if (serverError.detail) {
              console.log(serverError.detail)
            }
            break
          }
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'serverError' },
        },
      ],
    },
    // ネストしたif（if > if）
    {
      code: `
        const x = getValue()
        someCode()
        if (condition1) {
          if (condition2) {
            console.log(x)
          }
        }
      `,
      output: `
        someCode()
        if (condition1) {
          if (condition2) {
            const x = getValue()
            console.log(x)
          }
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // ネストしたif（if > if）（間にコードなし）
    {
      code: `
        const x = getValue()
        if (condition1) {
          if (condition2) {
            console.log(x)
          }
        }
      `,
      output: `
        if (condition1) {
          if (condition2) {
            const x = getValue()
            console.log(x)
          }
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // ネストしたswitch（if > switch）（block無し → blockを追加）
    {
      code: `
        const x = getValue()
        someCode()
        if (condition1) {
          switch (condition2) {
            case 'a':
              console.log(x)
              break
          }
        }
      `,
      output: `
        someCode()
        if (condition1) {
          switch (condition2) {
            case 'a': {
              const x = getValue()
              console.log(x)
              break
            }
          }
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // ネストしたswitch（if > switch）（間にコードなし、block無し → blockを追加）
    {
      code: `
        const x = getValue()
        if (condition1) {
          switch (condition2) {
            case 'a':
              console.log(x)
              break
          }
        }
      `,
      output: `
        if (condition1) {
          switch (condition2) {
            case 'a': {
              const x = getValue()
              console.log(x)
              break
            }
          }
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // ネストしたswitch（switch > if）
    {
      code: `
        const x = getValue()
        someCode()
        switch (condition1) {
          case 'a':
            if (condition2) {
              console.log(x)
            }
            break
        }
      `,
      output: `
        someCode()
        switch (condition1) {
          case 'a':
            if (condition2) {
              const x = getValue()
              console.log(x)
            }
            break
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // 深いネスト（if > if > if）
    {
      code: `
        const x = getValue()
        someCode()
        if (condition1) {
          if (condition2) {
            if (condition3) {
              console.log(x)
            }
          }
        }
      `,
      output: `
        someCode()
        if (condition1) {
          if (condition2) {
            if (condition3) {
              const x = getValue()
              console.log(x)
            }
          }
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // switch > switch (内側のcaseにblockを追加)
    {
      code: `
        const x = getValue()
        someCode()
        switch (condition1) {
          case 'a':
            switch (condition2) {
              case 'b':
                console.log(x)
                break
            }
            break
        }
      `,
      output: `
        someCode()
        switch (condition1) {
          case 'a':
            switch (condition2) {
              case 'b': {
                const x = getValue()
                console.log(x)
                break
              }
            }
            break
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // else if > if のネスト
    {
      code: `
        const x = getValue()
        someCode()
        if (condition1) {
          console.log("a")
        } else if (condition2) {
          if (condition3) {
            console.log(x)
          }
        }
      `,
      output: `
        someCode()
        if (condition1) {
          console.log("a")
        } else if (condition2) {
          if (condition3) {
            const x = getValue()
            console.log(x)
          }
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // let変数の移動
    {
      code: `
        let x = getValue()
        someCode()
        if (condition) {
          console.log(x)
        }
      `,
      output: `
        someCode()
        if (condition) {
          let x = getValue()
          console.log(x)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // ブロックなしelse（ブロック追加）
    {
      code: `
        const x = getValue()
        someCode()
        if (condition) {
          console.log("a")
        } else console.log(x)
      `,
      output: `
        someCode()
        if (condition) {
          console.log("a")
        } else {
const x = getValue()
console.log(x)
}
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // 深いネスト（if > else > if）
    {
      code: `
        const x = getValue()
        someCode()
        if (condition1) {
          console.log("a")
        } else {
          if (condition2) {
            console.log(x)
          }
        }
      `,
      output: `
        someCode()
        if (condition1) {
          console.log("a")
        } else {
          if (condition2) {
            const x = getValue()
            console.log(x)
          }
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // 同じif内で複数回使用
    {
      code: `
        const x = getValue()
        someCode()
        if (condition) {
          console.log(x)
          doSomething()
          console.log(x)
        }
      `,
      output: `
        someCode()
        if (condition) {
          const x = getValue()
          console.log(x)
          doSomething()
          console.log(x)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // 同じcase内で複数回使用（block無し → blockを追加）
    {
      code: `
        const x = getValue()
        someCode()
        switch (condition) {
          case 'a':
            console.log(x)
            doSomething()
            console.log(x)
            break
        }
      `,
      output: `
        someCode()
        switch (condition) {
          case 'a': {
            const x = getValue()
            console.log(x)
            doSomething()
            console.log(x)
            break
          }
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // ネストしたif内の複数箇所で使用
    {
      code: `
        const x = getValue()
        someCode()
        if (condition1) {
          if (condition2) {
            console.log(x)
          }
          if (condition3) {
            console.log(x)
          }
        }
      `,
      output: `
        someCode()
        if (condition1) {
          const x = getValue()
          if (condition2) {
            console.log(x)
          }
          if (condition3) {
            console.log(x)
          }
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // if内の複数ループで使用
    {
      code: `
        const x = getValue()
        someCode()
        if (condition) {
          for (let i = 0; i < 10; i++) {
            console.log(x)
          }
          for (let j = 0; j < 10; j++) {
            console.log(x)
          }
        }
      `,
      output: `
        someCode()
        if (condition) {
          const x = getValue()
          for (let i = 0; i < 10; i++) {
            console.log(x)
          }
          for (let j = 0; j < 10; j++) {
            console.log(x)
          }
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // if内の関数スコープで複数回使用
    {
      code: `
        const x = getValue()
        someCode()
        if (condition) {
          array.forEach(() => {
            console.log(x)
          })
          array.map(() => {
            return x
          })
        }
      `,
      output: `
        someCode()
        if (condition) {
          const x = getValue()
          array.forEach(() => {
            console.log(x)
          })
          array.map(() => {
            return x
          })
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // switch内のif（複数箇所）
    {
      code: `
        const x = getValue()
        someCode()
        switch (condition1) {
          case 'a':
            if (condition2) {
              console.log(x)
            }
            if (condition3) {
              console.log(x)
            }
            break
        }
      `,
      output: `
        someCode()
        switch (condition1) {
          case 'a': {
            const x = getValue()
            if (condition2) {
              console.log(x)
            }
            if (condition3) {
              console.log(x)
            }
            break
          }
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // else if内で複数回使用
    {
      code: `
        const x = getValue()
        someCode()
        if (condition1) {
          console.log("a")
        } else if (condition2) {
          console.log(x)
          doSomething()
          console.log(x)
        }
      `,
      output: `
        someCode()
        if (condition1) {
          console.log("a")
        } else if (condition2) {
          const x = getValue()
          console.log(x)
          doSomething()
          console.log(x)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // 基本的な早期return
    {
      code: `
        function test() {
          const data = processData()
          if (!condition) {
            return
          }
          console.log(data)
        }
      `,
      output: `
        function test() {
          if (!condition) {
            return
          }
          const data = processData()
          console.log(data)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'data' },
        },
      ],
    },
    // ガード節パターン
    {
      code: `
        function test() {
          const user = getUser()
          if (!isAuthenticated()) {
            return null
          }
          console.log(user)
        }
      `,
      output: `
        function test() {
          if (!isAuthenticated()) {
            return null
          }
          const user = getUser()
          console.log(user)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'user' },
        },
      ],
    },
    // throw文での早期終了
    {
      code: `
        function test() {
          const value = expensiveCalculation()
          if (!isValid()) {
            throw new Error('Invalid')
          }
          return value
        }
      `,
      output: `
        function test() {
          if (!isValid()) {
            throw new Error('Invalid')
          }
          const value = expensiveCalculation()
          return value
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'value' },
        },
      ],
    },
    // 複数の早期return
    {
      code: `
        function test() {
          const data = getData()
          if (condition1) {
            return
          }
          if (condition2) {
            return
          }
          if (condition3) {
            return
          }
          console.log(data)
        }
      `,
      output: `
        function test() {
          if (condition1) {
            return
          }
          if (condition2) {
            return
          }
          if (condition3) {
            return
          }
          const data = getData()
          console.log(data)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'data' },
        },
      ],
    },
    // switch文内のreturn
    {
      code: `
        function test() {
          const data = getData()
          switch (type) {
            case 'A':
              return null
            case 'B':
              return null
            default:
              break
          }
          console.log(data)
        }
      `,
      output: `
        function test() {
          switch (type) {
            case 'A':
              return null
            case 'B':
              return null
            default:
              break
          }
          const data = getData()
          console.log(data)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'data' },
        },
      ],
    },
    // try-finally（finally内でdataを使わない）
    {
      code: `
        function test() {
          const data = getData()
          try {
            if (condition) {
              return
            }
            console.log('other')
          } finally {
            cleanup()
          }
          console.log(data)
        }
      `,
      output: `
        function test() {
          try {
            if (condition) {
              return
            }
            console.log('other')
          } finally {
            cleanup()
          }
          const data = getData()
          console.log(data)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'data' },
        },
      ],
    },
    // try-catch（throw含む、try/catch内でdataを使わない）
    {
      code: `
        const data = getData()
        try {
          if (condition) {
            throw new Error('error')
          }
          console.log('other')
        } catch (e) {
          console.log('caught')
        }
        console.log(data)
      `,
      output: `
        try {
          if (condition) {
            throw new Error('error')
          }
          console.log('other')
        } catch (e) {
          console.log('caught')
        }
        const data = getData()
        console.log(data)
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'data' },
        },
      ],
    },
    // catch内でthrow（catch内でdataを使わない）
    {
      code: `
        const data = getData()
        try {
          someCode()
        } catch (e) {
          console.error('error occurred')
          throw e
        }
        console.log(data)
      `,
      output: `
        try {
          someCode()
        } catch (e) {
          console.error('error occurred')
          throw e
        }
        const data = getData()
        console.log(data)
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'data' },
        },
      ],
    },
    // catch内で条件付きthrow
    {
      code: `
        const data = getData()
        try {
          someCode()
        } catch (e) {
          if (critical) {
            throw e
          }
          console.log('recovered')
        }
        console.log(data)
      `,
      output: `
        try {
          someCode()
        } catch (e) {
          if (critical) {
            throw e
          }
          console.log('recovered')
        }
        const data = getData()
        console.log(data)
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'data' },
        },
      ],
    },
    // スコープ内で最初の使用箇所の前に別のstatementがある場合
    {
      code: `
        const x = getValue()
        someCode()
        if (condition) {
          console.log('first')
          console.log(x)
          doSomething()
        }
      `,
      output: `
        someCode()
        if (condition) {
          console.log('first')
          const x = getValue()
          console.log(x)
          doSomething()
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
  ],
})
