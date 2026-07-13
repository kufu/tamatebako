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
    { code: `() => { if (action) return action() }` },
    { code: `if (any) {} else if (action) { action() }` },
    // 条件部分が実行部分とマッチしない
    { code: `if (obj.hoge) { obj.fuga.action() }` },
    { code: `if (obj.hoge) { other.obj.hoge.action() }` },
    // パターン2: 複数条件がある場合は検出しない
    { code: `if (A.B && any) { A.B.C.d() }` },
    { code: `if (A.B || any) { A.B.C.d() }` },
    { code: `if (obj.hoge && condition) { obj.hoge.fuga.action() }` },
    // 否定されている場合
    { code: `if (!A.B) { A.B.C.d() }` },
    { code: `if (!obj.hoge) { obj.hoge.fuga.action() }` },
    // 条件部分が実行部分より長い場合
    { code: `if (A.B.C) { A.B.d() }` },
    { code: `if (obj.hoge.fuga) { obj.hoge.action() }` },
    // 条件部分が実行部分の途中にある場合
    { code: `if (B) { A.B.C.d() }` },
    { code: `if (hoge) { obj.hoge.action() }` },
    // 既にoptional chainingを使っている場合（誤検知しない）
    { code: `if (action) { action?.() }` },
    { code: `if (obj.hoge) { obj.hoge?.fuga.action() }` },
    // MemberExpressionの場合（クラッシュしない）
    { code: `if (a) { a?.b }` },
    { code: `if (obj.hoge) { obj.hoge?.fuga }` },
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
    // 条件部分が実行部分の先頭にマッチする場合
    { code: `if (A.B) { A.B.C.d() }`, errors: [{ message: ERROR }], output: 'A.B?.C.d()' },
    { code: `if (obj.hoge) { obj.hoge.fuga.action() }`, errors: [{ message: ERROR }], output: 'obj.hoge?.fuga.action()' },
    { code: `if (obj.hoge) obj.hoge.fuga.action()`, errors: [{ message: ERROR }], output: 'obj.hoge?.fuga.action()' },
    { code: `if (obj.hoge.fuga) { obj.hoge.fuga.method() }`, errors: [{ message: ERROR }], output: 'obj.hoge.fuga?.method()' },
    // 深いネスト
    { code: `if (a.b.c.d) { a.b.c.d.e.f() }`, errors: [{ message: ERROR }], output: 'a.b.c.d?.e.f()' },
    { code: `if (obj.a.b.c) obj.a.b.c.d.e()`, errors: [{ message: ERROR }], output: 'obj.a.b.c?.d.e()' },
    // $を含む変数名（エスケープが正しく機能すること）
    { code: `if ($$) { $$.foo() }`, errors: [{ message: ERROR }], output: '$$?.foo()' },
    { code: `if ($var) { $var.method() }`, errors: [{ message: ERROR }], output: '$var?.method()' },
  ],
})
