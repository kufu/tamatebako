const rule = require('../rules/best-practice-for-optional-chaining')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

const ERROR = `optional chaining(xxx?.yyyy記法)を利用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-optional-chaining`

ruleTester.run('best-practice-for-optional-chaining', rule, {
  valid: [
    { code: `action?.()` },
    { code: `obj.action?.(hoge, fuga)` },
    { code: `if (any) { action() }` },
    { code: `if (action && any) { action() }` },
    { code: `if (action) { action() } else { any() }` },
    { code: `if (obj.hoge) obj.hoge.fuga.action()` },
    { code: `() => { if (action) return action() }` },
    { code: `if (any) {} else if (action) { action() }` },
    // optional chainingが使われているが、条件部分とマッチしない
    { code: `if (obj.hoge) { obj.fuga?.action() }` },
    // 条件部分が実行部分の途中にあるが、先頭ではない
    { code: `if (obj.hoge) { other.obj.hoge?.action() }` },
  ],
  invalid: [
    { code: `if (action) action()`, errors: [{ message: ERROR }], output: 'action?.()' },
    { code: `if (obj.action) { obj.action(hoge, fuga) }`, errors: [{ message: ERROR }], output: 'obj.action?.(hoge, fuga)' },
    { code: `if (obj.hoge.fuga.action) obj.hoge.fuga.action()`, errors: [{ message: ERROR }], output: 'obj.hoge.fuga.action?.()' },
    { code: `
      if (obj.hoge.fuga.action) {
        obj.hoge.fuga.action(
          a,
          b,
          c
        )
      }
    `, errors: [{ message: ERROR }], output: `
      obj.hoge.fuga.action?.(
          a,
          b,
          c
        )
    ` },
    // 途中でoptional chainingが使われている場合
    { code: `if (obj.hoge) { obj.hoge?.fuga.action() }`, errors: [{ message: ERROR }], output: 'obj.hoge?.fuga.action()' },
    { code: `if (A.B) { A.B?.C.d() }`, errors: [{ message: ERROR }], output: 'A.B?.C.d()' },
    { code: `if (obj.hoge) obj.hoge?.fuga.action()`, errors: [{ message: ERROR }], output: 'obj.hoge?.fuga.action()' },
    // プロパティアクセスが続く場合
    { code: `if (obj.hoge.fuga) { obj.hoge.fuga?.action() }`, errors: [{ message: ERROR }], output: 'obj.hoge.fuga?.action()' },
  ],
})
