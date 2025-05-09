const rule = require('../rules/a11y-trigger-has-button')
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
ruleTester.run('a11y-trigger-has-button', rule, {
  valid: [
    { code: '<DropdownTrigger><button>hoge</button></DropdownTrigger>' },
    { code: '<DialogTrigger><button>{hoge}</button></DialogTrigger>' },
    { code: '<DropdownTrigger>{hoge}</DropdownTrigger>' },
  ],
  invalid: [
    { code: '<DropdownTrigger>ほげ</DropdownTrigger>', errors: [ { message: 'DropdownTrigger の直下にはbuttonコンポーネントのみ設置してください' } ] },
    { code: '<DialogTrigger><span><Button>ほげ</Button></span></DialogTrigger>', errors: [ { message: 'DialogTrigger の直下にはbuttonコンポーネントのみ設置してください' } ] },
    { code: '<DropdownTrigger><AnchorButton>ほげ</AnchorButton></DropdownTrigger>', errors: [ { message: 'DropdownTrigger の直下にはbuttonコンポーネントのみ設置してください' } ] },
    { code: '<DropdownTrigger><ButtonAnchor>ほげ</ButtonAnchor></DropdownTrigger>', errors: [ { message: 'DropdownTrigger の直下にはbuttonコンポーネントのみ設置してください' } ] },
    { code: '<DialogTrigger><button>{hoge}</button>{hoge}</DialogTrigger>', errors: [ { message: 'DialogTrigger の直下には複数のコンポーネントを設置することは出来ません。buttonコンポーネントが一つだけ設置されている状態にしてください' } ] },
    { code: '<DropdownTrigger>{hoge}<span>text</span></DropdownTrigger>', errors: [ { message: 'DropdownTrigger の直下には複数のコンポーネントを設置することは出来ません。buttonコンポーネントが一つだけ設置されている状態にしてください' } ] },
  ]
})
