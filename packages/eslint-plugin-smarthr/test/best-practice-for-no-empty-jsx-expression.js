const rule = require('../rules/best-practice-for-no-empty-jsx-expression')
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

ruleTester.run('best-practice-for-no-empty-jsx-expression', rule, {
  valid: [
    { code: `<div>hoge</div>` },
    { code: `<div><Hoge /></div>` },
    { code: `<div>{value}</div>` },
    { code: `<div>{condition && <Hoge />}</div>` },
    // コメントが残っている場合は対象外
    { code: `<div>{/* comment */}</div>` },
    { code: `<div>{ /* 何らかの注記 */ }</div>` },
  ],
  invalid: [
    // 完全に空(子要素がこれのみ)
    {
      code: `<div>{}</div>`,
      errors: [{ messageId: 'noEmptyJSXExpression' }],
    },
    // 空白のみ
    {
      code: `<div>{ }</div>`,
      errors: [{ messageId: 'noEmptyJSXExpression' }],
    },
    // 他の子要素と混在
    {
      code: `<div>{}<Hoge /></div>`,
      errors: [{ messageId: 'noEmptyJSXExpression' }],
    },
    // Fragment内
    {
      code: `<>{}</>`,
      errors: [{ messageId: 'noEmptyJSXExpression' }],
    },
    // 複数箇所
    {
      code: `<div>{}<span>{}</span></div>`,
      errors: [{ messageId: 'noEmptyJSXExpression' }, { messageId: 'noEmptyJSXExpression' }],
    },

    // fix: true の場合は自動修正される
    {
      code: `<div>{}</div>`,
      output: `<div></div>`,
      options: [{ fix: true }],
      errors: [{ messageId: 'noEmptyJSXExpression' }],
    },
    {
      code: `<div>{}<Hoge /></div>`,
      output: `<div><Hoge /></div>`,
      options: [{ fix: true }],
      errors: [{ messageId: 'noEmptyJSXExpression' }],
    },
  ],
})
