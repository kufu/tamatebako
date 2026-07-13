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

const ERROR_ADD = `optional chaining(xxx?.yyyy記法)を利用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-optional-chaining`

const ERROR_REMOVE = `条件文で既に存在チェックしているため、optional chainingは不要です
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
    // optional chainingが条件でカバーされていない範囲で使われている場合
    { code: `if (action) { action()?.bar() }` },
    { code: `if (obj.hoge) { obj.hoge.fuga?.action() }` },
  ],
  invalid: [
    { code: `if (action) action()`, errors: [{ message: ERROR_ADD }], output: 'action?.()' },
    { code: `if (obj.action) { obj.action(hoge, fuga) }`, errors: [{ message: ERROR_ADD }], output: 'obj.action?.(hoge, fuga)' },
    { code: `if (obj.hoge.fuga.action) obj.hoge.fuga.action()`, errors: [{ message: ERROR_ADD }], output: 'obj.hoge.fuga.action?.()' },
    { code: `
      if (obj.hoge.fuga.action) {
        obj.hoge.fuga.action(
          a,
          b,
          c
        )
      }
    `, errors: [{ message: ERROR_ADD }], output: `
      obj.hoge.fuga.action?.(
          a,
          b,
          c
        )
    ` },
    // 条件部分が実行部分の先頭にマッチする場合
    { code: `if (A.B) { A.B.C.d() }`, errors: [{ message: ERROR_ADD }], output: 'A.B?.C.d()' },
    { code: `if (obj.hoge) { obj.hoge.fuga.action() }`, errors: [{ message: ERROR_ADD }], output: 'obj.hoge?.fuga.action()' },
    { code: `if (obj.hoge) obj.hoge.fuga.action()`, errors: [{ message: ERROR_ADD }], output: 'obj.hoge?.fuga.action()' },
    { code: `if (obj.hoge.fuga) { obj.hoge.fuga.method() }`, errors: [{ message: ERROR_ADD }], output: 'obj.hoge.fuga?.method()' },
    // 深いネスト
    { code: `if (a.b.c.d) { a.b.c.d.e.f() }`, errors: [{ message: ERROR_ADD }], output: 'a.b.c.d?.e.f()' },
    { code: `if (obj.a.b.c) obj.a.b.c.d.e()`, errors: [{ message: ERROR_ADD }], output: 'obj.a.b.c?.d.e()' },
    // $を含む変数名（エスケープが正しく機能すること）
    { code: `if ($$) { $$.foo() }`, errors: [{ message: ERROR_ADD }], output: '$$?.foo()' },
    { code: `if ($var) { $var.method() }`, errors: [{ message: ERROR_ADD }], output: '$var?.method()' },
    // 不要なoptional chainingの削除
    { code: `if (action) { action?.() }`, errors: [{ message: ERROR_REMOVE }], output: 'action()' },
    { code: `if (obj.method) { obj.method?.() }`, errors: [{ message: ERROR_REMOVE }], output: 'obj.method()' },
    { code: `if (a.b) { a.b?.c() }`, errors: [{ message: ERROR_REMOVE }], output: 'a.b.c()' },
    { code: `if (a.b) { a.b?.c }`, errors: [{ message: ERROR_REMOVE }], output: 'a.b.c' },
    { code: `if (obj.hoge) { obj.hoge?.fuga.action() }`, errors: [{ message: ERROR_REMOVE }], output: 'obj.hoge.fuga.action()' },
    { code: `if ($$) { $$?.foo() }`, errors: [{ message: ERROR_REMOVE }], output: '$$.foo()' },
  ],
})
