const rule = require('../rules/best-practice-for-unnesessary-early-return')
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

const UNNESESSARY_EARLY_RETURN_ERROR = `後続の処理の逆の条件の早期returnのため修正してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-unnesessary-early-return
 - 本質的に行いたい処理の条件とは逆がifに記述されているため、ロジックを確認する際条件を逆転させて考える余計な手間が発生しています
 - 条件を逆転させたうえで後続の処理をifの内部に移動してください`
const SPLIT_EARLY_RETURN_ERROR = `早期returnのifが分割されています
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-unnesessary-early-return
 - 一つのifにまとめるよう、条件を調整してください`
const SPLIT_CONFIG_ERROR = `本質的に一つの条件が複数のifに分割されています
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-unnesessary-early-return
 - 直後のifと一つにまとめるよう、条件を調整してください`

ruleTester.run('best-practice-for-unnesessary-early-return', rule, {
  valid: [
    { code: `
      const anyAction = (a) => {
        if (a) {
          otherAction()
        }
      }
    ` },
    { code: `
      const sample2 = (a) => {
        if (!a) return

        const caculated = calc(a)
      }
    ` },
    { code: `
      const anyAction = (a) => {
        if (!a) {
          return
        } else {
        }
      }
    ` },
    { code: `
      const anyAction = (a) => {
        if (!a) {
          return
        } else if (any) {
        }
      }
    ` },
    { code: `
      const sample4 = (a, b) => {
        if (!a) {
          return
        }

        otherAction1(a)

        if (b === any) {
          return
        }

        otherAction2(b)
      }
    ` },
    { code: `
      const sample4 = (a, b) => {
        if (!a) {
          return
        }

        switch(a) {
          case 'hoge':
            break
        }
      }
    ` },
    { code: `
      const anyAction = (a) => {
        if (!a) {
          otherAction1()
          return
        }

        otherAction2()
      }
    ` },
    { code: `
      const anyAction = (a) => {
        if (!a) {
          return
        }

        return otherAction2()
      }
    ` },
    { code: `
      const anyAction = (a) => {
        if (!a) {
          return
        }

        try {
          otherAction()
        } catch {
        }
      }
    ` },
    { code: `
      const anyAction = (a) => {
        if (!a) {
          return
        }

        if (b) { /* any 1 */ } else { /* any 2 */ }
      }
    ` },
    { code: `
      const anyAction = (a) => {
        if (!a) {
          return
        }

        if (b) { /* any 1 */ }
        if (c) { /* any 2 */ }
      }
    ` },
    { code: `
      const anyAction = (a) => {
        if (!a) {
          return
        }

        if (b) { /* any 1 */ }
        if (c) { /* any 2 */ }
        any()
      }
    ` },
  ],
  invalid: [
    { code: `
      const anyAction = (a) => {
        if (!a) {
          return
        }

        otherAction()
      }
    `, errors: [ { message: UNNESESSARY_EARLY_RETURN_ERROR } ] },
    { code: `
      const anyAction = (a) => {
        const hoge = any

        if (!a) {
          return
        }

        otherAction()
      }
    `, errors: [ { message: UNNESESSARY_EARLY_RETURN_ERROR } ] },
    { code: `
      const anyAction = (a, b) => {
        if (!a || !b) {
          return
        }

        otherAction()
      }
    `, errors: [ { message: UNNESESSARY_EARLY_RETURN_ERROR } ] },
    { code: `
      const anyAction = (a, b) => {
        switch (a) {
          case 'hoge':
            break
        }

        if (!b) {
          return
        }

        otherAction()
      }
    `, errors: [ { message: UNNESESSARY_EARLY_RETURN_ERROR } ] },
    { code: `
      const anyAction = (a, b) => {
        // 早期returnより前に非早期returnのif,switchがある場合
        if (a && b) {
          return 'hoge'
        }

        // 早期return後にswitchがある場合強制終了されるが
        // このswitchは早期return前のため後続でエラーになる
        switch (a) {
          case 'hoge':
            break
        }

        if (!b) {
          return
        }

        otherAction()
      }
    `, errors: [ { message: UNNESESSARY_EARLY_RETURN_ERROR } ] },
    { code: `
      const anyAction = (a, b) => {
        if (!a) return
        if (!b) {
          return
        }

        otherAction()
      }
    `, errors: [ UNNESESSARY_EARLY_RETURN_ERROR, SPLIT_EARLY_RETURN_ERROR ] },
    { code: `
      const anyAction = (a, b) => {
        if (!a) {
          return
        }

        if (b) { /* any 1 */ }
      }
    `, errors: [ SPLIT_CONFIG_ERROR ] },
  ]
})
