const rule = require('../rules/best-practice-for-optional-chaining')
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
  ],
})
