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

const DETAIL_LINK = `
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-rest-parameters`
const ERROR_REST_NAME = `残余引数には 'rest' という名称を指定してください${DETAIL_LINK}`
const ERROR_NOT_REST_NAME = `残余引数以外に 'rest' という名称を利用しないでください${DETAIL_LINK}
 - 残余引数(rest parameters)と混同する可能性があるため別の名称に修正してください`
const ERROR_REST_CHILD_REF = `残余引数内の属性を参照しないでください${DETAIL_LINK}`

ruleTester.run('best-practice-for-rest-parameters', rule, {
  valid: [
    { code: `const hoge = (a, b, ...rest) => {}` },
    { code: `const hoge = ({ a, b, ...rest }) => {}` },
    { code: `const hoge = (props) => {}` },
    { code: `const props = {}` },
    { code: `const hogeRest = {}` },
    { code: `const hoge = { fuga: rest }` },
    { code: `const hoge = rest` },
    { code: `const hoge = hoge.rest.fuga` },
    { code: `const hoge = { ...rest }` },
    { code: `const hoge = [rest]` },
    { code: `hoge(rest)` },
    { code: `<Any {...rest} />` },
  ],
  invalid: [
    { code: `const hoge = (a, b, ...props) => {}`, errors: [ { message: ERROR_REST_NAME } ] },
    { code: `const hoge = ({ a, b, ...props }) => {}`, errors: [ { message: ERROR_REST_NAME } ] },
    { code: `const hoge = (rest) => {}`, errors: [ { message: ERROR_NOT_REST_NAME } ] },
    { code: `const hoge = (a, b, rest) => {}`, errors: [ { message: ERROR_NOT_REST_NAME } ] },
    { code: `const hoge = ({ a: rest, b }) => {}`, errors: [ { message: ERROR_NOT_REST_NAME } ] },
    { code: `const rest = {}`, errors: [ { message: ERROR_NOT_REST_NAME } ] },
    { code: `const hoge = { rest }`, errors: [ { message: ERROR_NOT_REST_NAME } ] },
    { code: `const hoge = { rest: fuga }`, errors: [ { message: ERROR_NOT_REST_NAME } ] },
    { code: `const hoge = rest.hoge`, errors: [ { message: ERROR_REST_CHILD_REF } ] },
    { code: `const hoge = rest.hoge.fuga`, errors: [ { message: ERROR_REST_CHILD_REF } ] },
  ]
})

