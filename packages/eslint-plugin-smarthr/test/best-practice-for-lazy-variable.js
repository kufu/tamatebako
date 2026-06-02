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
    // ネストしたif（if > if）- 対象外
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
  ],
})
