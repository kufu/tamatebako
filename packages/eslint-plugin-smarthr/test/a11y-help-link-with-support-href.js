const rule = require('../rules/a11y-help-link-with-support-href')
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
const errorText = `ヘルプページ用のリンクは smarthr-ui/HelpLink コンポーネントを利用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-help-link-with-support-href`

ruleTester.run('a11y-help-link-with-support-href', rule, {
  valid: [
    { code: `<HelpLink href="//support.hoge">any</HelpLink>` },
    { code: `<Hoge href="//support.hoge">any</Hoge>` },
    { code: `<HelpLink href="//support.hoge" />` },
    { code: `<HelpLink href={"//support.hoge"} />` },
    { code: `<HelpLink href={path.support.hoge} />` },
    { code: `<HelpLink href={supportURL} />` },
    { code: `<HelpLink href={supportHref} />` },
  ],
  invalid: [
    { code: `<Anchor href="//support.hoge">any</Anchor>`, errors: [{ message: errorText }] },
    { code: `<HogeLink href={path.support.hoge} />`, errors: [{ message: errorText }] },
    { code: `<a href={supportUrl}>ほげ</a>`, errors: [{ message: errorText }] },
    { code: `<HogeLink href={path.support.hoge?.fuga} />`, errors: [{ message: errorText }] },
    { code: `<HogeAnchor href={a ? path.support.hoge?.fuga : null} />`, errors: [{ message: errorText }] },
    { code: `<HogeLink href={a ? undefined : supportHogeHref} />`, errors: [{ message: errorText }] },
  ]
})
