const rule = require('../rules/trim-props')
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

const ERROR_MESSAGE = `属性に設定している文字列から先頭、末尾の空白文字を削除してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/trim-props`

ruleTester.run('trim-props', rule, {
  valid: [
    { code: '<a href="https://www.google.com">google</a>' },
    { code: '<a href={"https://www.google.com"}>google</a>' },
    { code: '<img src="/sample.jpg" alt="sample" />' },
    { code: `<img src={'/sample.jpg'} alt={'sample'} />` },
    { code: '<div data-spec="info-area">....</div>' },
    { code: '<div data-spec={`a${b} c`}>....</div>' },
    { code: '<div data-spec={`a${b ? ` ${c} ` : "  "} d`}>....</div>' },
  ],
  invalid: [
    {
      code: '<a href=" https://www.google.com">google</a>',
      output: '<a href="https://www.google.com">google</a>',
      errors: [{ message: ERROR_MESSAGE }],
    },
    {
      code: '<a href="https://www.google.com ">google</a>',
      output: '<a href="https://www.google.com">google</a>',
      errors: [{ message: ERROR_MESSAGE }],
    },
    {
      code: '<a href=" https://www.google.com ">google</a>',
      output: '<a href="https://www.google.com">google</a>',
      errors: [{ message: ERROR_MESSAGE }],
    },
    {
      code: '<a href={" https://www.google.com"}>google</a>',
      output: '<a href={"https://www.google.com"}>google</a>',
      errors: [{ message: ERROR_MESSAGE }],
    },
    {
      code: '<a href={"https://www.google.com "}>google</a>',
      output: '<a href={"https://www.google.com"}>google</a>',
      errors: [{ message: ERROR_MESSAGE }],
    },
    {
      code: '<a href={" https://www.google.com "}>google</a>',
      output: '<a href={"https://www.google.com"}>google</a>',
      errors: [{ message: ERROR_MESSAGE }],
    },
    {
      code: '<img src=" /sample.jpg" alt="sample " />',
      output: '<img src="/sample.jpg" alt="sample" />',
      errors: [
        { message: ERROR_MESSAGE },
        { message: ERROR_MESSAGE },
      ],
    },
    {
      code: `<img src={' /sample.jpg'} alt={'sample '} />`,
      output: `<img src={'/sample.jpg'} alt={'sample'} />`,
      errors: [
        { message: ERROR_MESSAGE },
        { message: ERROR_MESSAGE },
      ],
    },
    {
      code: '<div data-spec=" info-area ">....</div>',
      output: '<div data-spec="info-area">....</div>',
      errors: [{ message: ERROR_MESSAGE }],
    },
    {
      code: '<div data-spec={" info-area "}>....</div>',
      output: '<div data-spec={"info-area"}>....</div>',
      errors: [{ message: ERROR_MESSAGE }],
    },
    {
      code: '<div data-spec={` ab c `}>....</div>',
      output: '<div data-spec={`ab c`}>....</div>',
      errors: [{ message: ERROR_MESSAGE }],
    },
    {
      code: '<div data-spec={` a${b} c `}>....</div>',
      output: '<div data-spec={`a${b} c`}>....</div>',
      errors: [{ message: ERROR_MESSAGE }],
    },
    {
      code: '<div data-spec={` a${b ? ` ${c} ` : "  "} d `}>....</div>',
      output: '<div data-spec={`a${b ? ` ${c} ` : "  "} d`}>....</div>',
      errors: [{ message: ERROR_MESSAGE }],
    },
  ],
})
