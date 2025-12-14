const rule = require('../rules/best-practice-for-prohibit-import-smarthr-ui-local')
const RuleTester = require('eslint').RuleTester

const ERROR_MESSAGE = `smarthr-uiからコンポーネントや型をimportする際は 'smarthr-ui' からimportしてください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-prohibit-import-smarthr-ui-local
 - 'smarthr-ui/lib/components' 以下からのexportはsmarthr-uiの内部実装・もしくはstorybook用であり、プロダクトからの利用は非推奨です
 - 型を使いたい場合、コンポーネントからreact/ComponentPropsを利用し生成するように修正してください`

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})
ruleTester.run('best-practice-for-prohibit-import-smarthr-ui-local', rule, {
  valid: [
    { code: `import { AnchorButton } from 'smarthr-ui'` },
  ],
  invalid: [
    { code: `import { AnchorButton } from 'smarthr-ui/lib/components/Button/AnchorButton'`, errors: [ { message: ERROR_MESSAGE } ] },
    { code: `import { FaArrowRightIcon } from 'smarthr-ui/lib/components/Icon'`, errors: [ { message: ERROR_MESSAGE } ] },
    { code: `import { HeadingTagTypes } from 'smarthr-ui/lib/components/Heading/Heading'`, errors: [ { message: ERROR_MESSAGE } ] },
  ]
})
