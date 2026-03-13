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
    { code: '<DialogTrigger><AnyButton>{hoge}</AnyButton></DialogTrigger>' },
    { code: '<DisclosureTrigger>{hoge}</DisclosureTrigger>' },
    { code: '<AnyDropdownTrigger/>' },
    { code: '<Trigger>hoge</Trigger>' },
  ],
  invalid: [
    { code: '<DropdownTrigger>ほげ</DropdownTrigger>', errors: [ { message: `DropdownTrigger の直下にはbutton要素のみ設置してください(AnchorButtonはa要素のため設置できません)
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-trigger-has-button` } ] },
    { code: '<DialogTrigger><span><Button>ほげ</Button></span></DialogTrigger>', errors: [ { message: `DialogTrigger の直下にはbutton要素のみ設置してください(AnchorButtonはa要素のため設置できません)
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-trigger-has-button` } ] },
    { code: '<DisclosureTrigger><AnchorButton>ほげ</AnchorButton></DisclosureTrigger>', errors: [ { message: `DisclosureTrigger の直下にはbutton要素のみ設置してください(AnchorButtonはa要素のため設置できません)
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-trigger-has-button` } ] },
    { code: '<DropdownTrigger><ButtonAnchor>ほげ</ButtonAnchor></DropdownTrigger>', errors: [ { message: `DropdownTrigger の直下にはbutton要素のみ設置してください(AnchorButtonはa要素のため設置できません)
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-trigger-has-button` } ] },
    { code: '<DialogTrigger><button>{hoge}</button>{hoge}</DialogTrigger>', errors: [ { message: `DialogTrigger の直下には複数のコンポーネントを設置することは出来ません。button要素が一つだけ設置されている状態にしてください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-trigger-has-button` } ] },
    { code: '<DisclosureTrigger>{hoge}<span>text</span></DisclosureTrigger>', errors: [ { message: `DisclosureTrigger の直下には複数のコンポーネントを設置することは出来ません。button要素が一つだけ設置されている状態にしてください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-trigger-has-button` } ] },
  ]
})
