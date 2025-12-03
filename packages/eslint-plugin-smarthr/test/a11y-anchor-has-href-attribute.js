const rule = require('../rules/a11y-anchor-has-href-attribute')
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
const generateErrorText = (name) => `${name} に href 属性を正しく設定してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-anchor-has-href-attribute
 - onClickなどでページ遷移する場合でもhref属性に遷移先のURIを設定してください
   - Cmd + clickなどのキーボードショートカットに対応出来ます
 - onClickなどの動作がURLの変更を行わない場合、button要素でマークアップすることを検討してください
   - href属性に空文字(""など)や '#' が設定されている場合、実質画面遷移を行わないため、同様にbutton要素でマークアップすることを検討してください
 - リンクが存在せず無効化されていることを表したい場合、href属性に undefined を設定してください
   - button要素のdisabled属性が設定された場合に相当します`

ruleTester.run('a11y-anchor-has-href-attribute', rule, {
  valid: [
    { code: `<a href="hoge">ほげ</a>` },
    { code: `<a href={hoge}>ほげ</a>` },
    { code: `<a href={undefined}>ほげ</a>` },
    { code: `<HogeAnchor href={hoge}>ほげ</HogeAnchor>` },
    { code: `<Link href="hoge">ほげ</Link>` },
    { code: `<Link href="#fuga">ほげ</Link>` },
    { code: '<AnyAnchor {...args1} />', options: [{ checkType: 'allow-spread-attributes' }] },
  ],
  invalid: [
    { code: `<a></a>`, errors: [{ message: generateErrorText('a') }] },
    { code: `<a>hoge</a>`, errors: [{ message: generateErrorText('a') }] },
    { code: `<Anchor>hoge</Anchor>`, errors: [{ message: generateErrorText('Anchor') }] },
    { code: `<HogeLink>hoge</HogeLink>`, errors: [{ message: generateErrorText('HogeLink') }] },
    { code: `<HogeLink href>hoge</HogeLink>`, errors: [{ message: generateErrorText('HogeLink') }] },
    { code: `<HogeLink href="hoge"><a>hoge</a></HogeLink>`, errors: [{ message: generateErrorText('a') }] },
    { code: `<HogeLink to="hoge">hoge</HogeLink>`, errors: [{ message: generateErrorText('HogeLink') }] },
    { code: `<HogeLink href="">hoge</HogeLink>`, errors: [{ message: generateErrorText('HogeLink') }] },
    { code: `<HogeLink href={""}>hoge</HogeLink>`, errors: [{ message: generateErrorText('HogeLink') }] },
    { code: `<HogeLink href={''}>hoge</HogeLink>`, errors: [{ message: generateErrorText('HogeLink') }] },
    { code: `<HogeLink href="#">hoge</HogeLink>`, errors: [{ message: generateErrorText('HogeLink') }] },
    { code: `<HogeLink href={'#'}>hoge</HogeLink>`, errors: [{ message: generateErrorText('HogeLink') }] },
    { code: '<AnyAnchor {...args1} />', errors: [{ message: generateErrorText('AnyAnchor') }] },
    { code: '<AnyAnchor {...args1} />', options: [{ checkType: 'always' }], errors: [{ message: generateErrorText('AnyAnchor') }] },
  ]
})
