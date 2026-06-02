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
    // ループ内のif - 対象外
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
    // if内のループ - 対象外（ループを超える）
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
  ],
  invalid: [
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
    // switch case内で使用
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
  case 'a':
    const x = getValue()
    console.log(x)
    break
}`,
      errors: [
        {
          messageId: 'moveToLazy',
          data: { name: 'x' },
        },
      ],
    },
    // switch default内で使用
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
          default:
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
    // ネストしたswitch（if > switch）
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
            case 'a':
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
    // switch > switch
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
              case 'b':
                const x = getValue()
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
  ],
})
