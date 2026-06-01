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
    // 条件分岐がない場合
    {
      code: `
        const x = 1
        console.log(x)
        console.log(x)
      `,
    },
    // 条件分岐の外でも使われる
    {
      code: `
        const x = 1
        console.log(x)
        if (condition) {
          console.log(x)
        }
      `,
    },
    // すでに最適な位置（条件直前、間に何もない）
    {
      code: `
        const x = getValue()
        if (x) {
          console.log("ok")
        }
      `,
    },
    // すでに最適な位置（body内使用、if直前、間に何もない）
    {
      code: `
        if (condition) {
          const x = getValue()
          console.log(x)
        }
      `,
    },
    // 関数スコープから参照される（異なるスコープ）
    {
      code: `
        const x = 1
        function foo() {
          if (condition) {
            console.log(x)
          }
        }
      `,
    },
    // クロージャで参照される
    {
      code: `
        const x = 1
        const fn = () => {
          if (condition) {
            return x
          }
        }
      `,
    },
    // ネストした関数内で条件分岐内のみで使用
    {
      code: `
        function outer() {
          const x = 1
          function inner() {
            if (condition) {
              console.log(x)
              console.log(x)
            }
          }
        }
      `,
    },
    // ループ前の事前計算（有用な変数）
    {
      code: `
        const arr = getArray()
        const len = arr.length
        for (let i = 0; i < len; i++) {
          if (condition) {
            console.log(arr[i])
          }
        }
      `,
    },
    // ループ内で条件分岐があっても、ループ自体は条件分岐ではない
    {
      code: `
        const x = getValue()
        for (let i = 0; i < 10; i++) {
          if (condition) {
            console.log(x)
          }
        }
      `,
    },
    // 複数の独立した条件分岐で使用される（移動先が一意でない）
    {
      code: `
        const x = getValue()
        if (condition1) {
          console.log(x)
        }
        if (condition2) {
          console.log(x)
        }
      `,
    },
    // 複数の三項演算子で使用される
    {
      code: `
        const x = getValue()
        const y = condition ? x : 0
        const z = otherCondition ? x : 1
      `,
    },
    // 複数の論理演算子で使用される
    {
      code: `
        const x = getValue()
        const y = condition && x
        const z = otherCondition || x
      `,
    },
    // ネストした条件分岐（複数の独立したブランチ）
    {
      code: `
        const x = getValue()
        if (condition1) {
          if (condition2) {
            console.log(x)
          }
        }
        if (condition3) {
          console.log(x)
        }
      `,
    },
    // 異なる条件分岐タイプの組み合わせ（if + switch）
    {
      code: `
        const x = getValue()
        if (condition1) {
          console.log(x)
        }
        switch (condition2) {
          case 'a':
            console.log(x)
            break
        }
      `,
    },
    // switch文の複数のcaseで使用される
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
    // ネストした条件分岐（if > switch、条件とbodyで使用）- valid（複数箇所で使用）
    {
      code: `
        const x = getValue()
        if (condition1) {
          console.log(x)
          switch (condition2) {
            case 'a':
              console.log(x)
              break
          }
        }
      `,
    },
    // ネストした条件分岐（switch > if、複数caseで使用）- valid
    {
      code: `
        const x = getValue()
        switch (condition1) {
          case 'a':
            if (condition2) {
              console.log(x)
            }
            break
          case 'b':
            console.log(x)
            break
        }
      `,
    },
    // ネストした条件分岐（switch > switch、外側の複数caseで使用）- valid
    {
      code: `
        const x = getValue()
        switch (condition1) {
          case 'a':
            switch (condition2) {
              case 'b':
                console.log(x)
                break
            }
            break
          case 'c':
            console.log(x)
            break
        }
      `,
    },
    // 異なる条件分岐タイプの組み合わせ（三項演算子 + if）
    {
      code: `
        const x = getValue()
        const y = condition1 ? x : 0
        if (condition2) {
          console.log(x)
        }
      `,
    },
    // オプショナルチェーン複数
    {
      code: `
        const x = getValue()
        const y = obj1?.prop(x)
        const z = obj2?.method(x)
      `,
    },
  ],
  invalid: [
    // 再代入がある場合（if内で代入）
    {
      code: `
        let x = 0
        someCode()
        if (condition) {
          x = 10
          console.log(x)
        }
      `,
      output: `
        
        someCode()
        let x = 0
if (condition) {
          x = 10
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
    // 再代入がある場合（UpdateExpression: ++）
    {
      code: `
        let count = 0
        someCode()
        if (condition) {
          count++
          console.log(count)
        }
      `,
      output: `
        
        someCode()
        let count = 0
if (condition) {
          count++
          console.log(count)
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'count' },
        },
      ],
    },
    // 再代入がある場合（forEach内で再代入、if文で参照）
    {
      code: `
        let update = false
        someCode()
        array.forEach(() => {
          update = true
        })
        if (update) {
          doSomething()
        }
      `,
      output: `
        
        someCode()
        let update = false
array.forEach(() => {
          update = true
        })
        if (update) {
          doSomething()
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'update' },
        },
      ],
    },
    // 再代入がある場合（forEach内で再代入、if文で参照）
    {
      code: `
        let total = 0
        someCode()
        array.forEach((item) => {
          total += item.value
        })
        if (total > 100) {
          doSomething()
        }
      `,
      output: `
        
        someCode()
        let total = 0
array.forEach((item) => {
          total += item.value
        })
        if (total > 100) {
          doSomething()
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'total' },
        },
      ],
    },
    // 基本パターン: body内で使用、間に他のコードがある
    {
      code: `const x = getValue()
someCode()
if (condition) {
  console.log(x)
  console.log(x)
}`,
      output: `
someCode()
if (condition) {
  const x = getValue()
console.log(x)
  console.log(x)
}`,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // 間に複数の関数呼び出し
    {
      code: `
        const x = getValue()
        someCode1()
        someCode2()
        someCode3()
        if (condition) {
          console.log(x)
        }
      `,
      output: `
        
        someCode1()
        someCode2()
        someCode3()
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
    // 間に変数宣言がある
    {
      code: `
        const x = getValue()
        const y = getOther()
        const z = getAnother()
        if (condition) {
          console.log(x)
        }
      `,
      output: `
        
        const y = getOther()
        const z = getAnother()
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
    // 間にループがある
    {
      code: `
        const x = getValue()
        for (let i = 0; i < 10; i++) {
          doSomething(i)
        }
        if (condition) {
          console.log(x)
        }
      `,
      output: `
        
        for (let i = 0; i < 10; i++) {
          doSomething(i)
        }
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
    // 間に無関係の条件分岐がある
    {
      code: `
        const x = getValue()
        if (otherCondition) {
          doSomething()
        }
        if (condition) {
          console.log(x)
        }
      `,
      output: `
        
        if (otherCondition) {
          doSomething()
        }
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
    // 間に複数の異なるタイプの文がある
    {
      code: `
        const x = getValue()
        const y = getY()
        someCode()
        while (check()) {
          process()
        }
        const z = getZ()
        if (condition) {
          console.log(x)
        }
      `,
      output: `
        
        const y = getY()
        someCode()
        while (check()) {
          process()
        }
        const z = getZ()
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
    // 条件部分で使用、間に他のコードがある
    {
      code: `
        const x = getValue()
        someCode()
        if (x) {
          console.log("ok")
        }
      `,
      output: `
        
        someCode()
        const x = getValue()
if (x) {
          console.log("ok")
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // switchStatement単一caseで使用
    {
      code: `
        const x = getValue()
        someCode()
        switch (condition) {
          case 'a':
            console.log(x)
            break
        }
      `,
      output: `
        
        someCode()
        switch (condition) {
          case 'a':
            const x = getValue()
console.log(x)
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
    // 単一の三項演算子で使用
    {
      code: `
        const x = getValue()
        someCode()
        const y = condition ? x : 0
      `,
      output: `
        
        someCode()
        const x = getValue()
const y = condition ? x : 0
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // 単一の論理演算子で使用
    {
      code: `
        const x = getValue()
        someCode()
        const y = condition && x
      `,
      output: `
        
        someCode()
        const x = getValue()
const y = condition && x
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // ネストした条件分岐内（単一のブロック）
    {
      code: `
        const x = getValue()
        someCode()
        if (condition1) {
          if (condition2) {
            console.log(x)
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
    // 条件部分とbody内の両方で使用（条件優先）
    {
      code: `
        const x = getValue()
        someCode()
        if (x > 0) {
          console.log(x)
        }
      `,
      output: `
        
        someCode()
        const x = getValue()
if (x > 0) {
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
    // switchのdiscriminant（条件部分）で使用
    {
      code: `
        const x = getValue()
        someCode()
        switch (x) {
          case 'a':
            console.log("a")
            break
        }
      `,
      output: `
        
        someCode()
        const x = getValue()
switch (x) {
          case 'a':
            console.log("a")
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
    // ネストした条件分岐（if > switch、条件とbodyで使用）
    {
      code: `
        const x = getValue()
        someCode()
        if (x > 0) {
          switch (condition2) {
            case 'a':
              console.log(x)
              break
          }
        }
      `,
      output: `
        
        someCode()
        const x = getValue()
if (x > 0) {
          switch (condition2) {
            case 'a':
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
    // ネストした条件分岐（switch > if、条件とbodyで使用）
    {
      code: `
        const x = getValue()
        someCode()
        switch (x) {
          case 'a':
            if (condition2) {
              console.log(x)
            }
            break
        }
      `,
      output: `
        
        someCode()
        const x = getValue()
switch (x) {
          case 'a':
            if (condition2) {
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
    // ネストした条件分岐（switch > switch、条件とbodyで使用）
    {
      code: `
        const x = getValue()
        someCode()
        switch (x) {
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
        const x = getValue()
switch (x) {
          case 'a':
            switch (condition2) {
              case 'b':
                console.log(x)
                break
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
    // オプショナルチェーン（単一）
    {
      code: `
        const x = getValue()
        someCode()
        const y = obj?.prop(x)
      `,
      output: `
        
        someCode()
        const x = getValue()
const y = obj?.prop(x)
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // 1回だけ使用される
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
    // 複数の変数が条件部分で使用される（x, y の順）
    {
      code: `
        const x = getValue1()
        const y = getValue2()
        someCode()
        if (x && y) {
          console.log("ok")
        }
      `,
      output: `
        
        
        someCode()
        const x = getValue1()
const y = getValue2()
if (x && y) {
          console.log("ok")
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
        {
          messageId: 'moveToLazy',
          data: { name: 'y' },
        },
      ],
    },
    // 複数の変数が条件部分で使用される（y, x の順で宣言）
    {
      code: `
        const y = getValue2()
        const x = getValue1()
        someCode()
        if (x && y) {
          console.log("ok")
        }
      `,
      output: `
        
        
        someCode()
        const x = getValue1()
const y = getValue2()
if (x && y) {
          console.log("ok")
        }
      `,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'y' },
        },
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
  ],
})

