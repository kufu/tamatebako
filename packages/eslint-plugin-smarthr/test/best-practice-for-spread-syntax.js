const rule = require('../rules/best-practice-for-spread-syntax')
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

const errorMessage = (code) => `"${code}" は意図しない上書きを防ぐため、spread syntaxでない属性より先に記述してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-spread-syntax`

ruleTester.run('best-practice-for-spread-syntax', rule, {
  valid: [
    { code: `<Fuga {...props} id={props.id || 'ABC'} />` },
    { code: `<Fuga {...props1} {...props2} id="ABC" />` },
    { code: `const hoge = { ...props, id: props.id || 'ABC' }` },
    { code: `const hoge = { ...props1, ...props2, id: 'ABC' }` },
    { code: `dig(target, ...keys.slice(1))` },
    { code: `{[...Array(3)].map((_, i) => (i))}`, options: [ { checkType: 'only-jsx' } ], },
    { code: `<Fuga id={props.id || 'ABC'} {...props} />`, options: [ { checkType: 'only-object' } ], },
  ],
  invalid: [
    {
      code: `<Fuga id={props.id || 'ABC'} {...props} />`,
      options: [ { fix: true } ],
      errors: [ { message: errorMessage('{...props}') } ],
      output: `<Fuga {...props} id={props.id || 'ABC'} />`
    },
    {
      code: `<Fuga {...props1} id="ABC" {...props2} />`,
      options: [ { fix: true, checkType: 'only-jsx' } ],
      errors: [  { message: errorMessage('{...props2}') } ],
      output: `<Fuga {...props1} {...props2} id="ABC" />`
    },
    {
      code: `<Fuga id="ABC" {...props1} {...props2} />`,
      options: [ { fix: true, checkType: 'only-jsx' } ],
      errors: [ { message: errorMessage('{...props1}') }, { message: errorMessage('{...props2}') } ],
      output: `<Fuga {...props1} {...props2} id="ABC" />`
    },
    {
      code: `const hoge = { id: props.id || 'ABC', ...props }`,
      options: [ { fix: true, checkType: 'only-object' } ],
      errors: [ { message: errorMessage('...props') } ],
      output: `const hoge = { ...props, id: props.id || 'ABC' }`
    },
    {
      code: `const hoge = { ...props1, id: 'ABC', ...props2 }`,
      options: [ { fix: true, checkType: 'only-object' } ],
      errors: [ { message: errorMessage('...props2') } ],
      output: `const hoge = { ...props1, ...props2, id: 'ABC' }`
    },
    {
      code: `const hoge = { id: 'ABC', ...props1, ...props2 }`,
      options: [ { fix: true, checkType: 'only-object' } ],
      errors: [ { message: errorMessage('...props1') }, { message: errorMessage('...props2') } ],
      output: `const hoge = { ...props1, ...props2, id: 'ABC' }`
    },
  ]
})
