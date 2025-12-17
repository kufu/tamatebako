const rule = require('../rules/best-practice-for-rest-parameters')
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

const ERROR_PROPS = `残余引数には 'props' という名称を利用しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-rest-parameters
 - 'rest' という名称を推奨します`
const ERROR_REST = `残余引数以外に 'rest' という名称を利用しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-rest-parameters
 - 残余引数(rest parameters)と混同する可能性があるため別の名称に修正してください`

ruleTester.run('best-practice-for-rest-parameters', rule, {
  valid: [
    { code: `const hoge = (a, b, ...rest) => {}` },
    { code: `const hoge = ({ a, b, ...rest }) => {}` },
    { code: `const hoge = (a, b, ...hoge) => {}` },
    { code: `const hoge = ({ a, b, ...xxxProps }) => {}` },
    { code: `const hoge = (props) => {}` },
    { code: `const props = {}` },
    { code: `const hogeRest = {}` },
  ],
  invalid: [
    { code: `const hoge = (a, b, ...props) => {}`, errors: [ { message: ERROR_PROPS } ] },
    { code: `const hoge = ({ a, b, ...props }) => {}`, errors: [ { message: ERROR_PROPS } ] },
    { code: `const hoge = (rest) => {}`, errors: [ { message: ERROR_REST } ] },
    { code: `const hoge = (a, b, rest) => {}`, errors: [ { message: ERROR_REST } ] },
    { code: `const rest = {}`, errors: [ { message: ERROR_REST } ] },
  ]
})

