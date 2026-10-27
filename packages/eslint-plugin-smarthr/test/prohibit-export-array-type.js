const rule = require('../rules/prohibit-export-array-type')
const RuleTester = require('eslint').RuleTester
const tseslint = require('typescript-eslint')

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

const ERROR_MESSAGE = `型をexportする際、配列ではなくアイテムの型をexportしてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/prohibit-export-array-type
 - 型を配列でexportすると、その型が配列かどうかを判定するための情報は名称のみになります
 - 名称から配列かどうかを判定しにくい場合があるため、利用するファイル内で配列として型を設定してください`

ruleTester.run('prohibit-export-array-type', rule, {
  valid: [
    { code: `export type User = { name: string }` },
    { code: `export type Users = User` },
    { code: `type UserArray = User[]` },
    { code: `const users: User[] = []` },
  ],
  invalid: [
    {
      code: `export type Users = User[]`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `export type Items = Array<Item>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
  ]
})
