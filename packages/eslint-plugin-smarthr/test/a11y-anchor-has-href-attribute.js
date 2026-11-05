const fs = require('fs')
const os = require('os')
const path = require('path')
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
const generateErrorText = (name, attributes = 'href') => `${name} に ${attributes} 属性を正しく設定してください
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
    // TemplateLiteral - 変数のみ
    { code: '<a href={`${path}`}>link</a>' },
    { code: '<a href={`/path/${id}`}>link</a>' },
    // TemplateLiteral - アンカーリンク
    { code: '<HogeLink href={`#${hash}`}>hoge</HogeLink>' },
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
    { code: `<HogeLink href="#">hoge</HogeLink>`, errors: [{ message: generateErrorText('HogeLink') }] },
    { code: '<AnyAnchor {...args1} />', errors: [{ message: generateErrorText('AnyAnchor') }] },
    { code: '<AnyAnchor {...args1} />', options: [{ checkType: 'always' }], errors: [{ message: generateErrorText('AnyAnchor') }] },
  ]
})

// OPTIONはルールを読み込んだ時点のprocess.cwd()にあるpackage.jsonのdependenciesから決まる
// そのため一時ディレクトリにpackage.jsonを置いてprocess.cwd()がそこを返すようにし、モジュールキャッシュを分けてルールを読み込み直す
const requireRuleWithDependencies = (dependencies) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a11y-anchor-has-href-attribute-'))
  const cwdSpy = jest.spyOn(process, 'cwd').mockReturnValue(dir)

  try {
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ dependencies }))

    let isolatedRule
    jest.isolateModules(() => {
      isolatedRule = require('../rules/a11y-anchor-has-href-attribute')
    })

    return isolatedRule
  } finally {
    cwdSpy.mockRestore()
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

ruleTester.run('a11y-anchor-has-href-attribute (dependencies: react-router)', requireRuleWithDependencies({ 'react-router': '*' }), {
  valid: [
    // to属性をhref属性と同等として扱う
    { code: `<Link to="/foo">any</Link>` },
  ],
  invalid: [
    { code: `<Link>any</Link>`, errors: [{ message: generateErrorText('Link', 'href、もしくはto') }] },
    // Link直下のa要素の例外はnextを利用している場合のみ
    { code: `<Link href="/foo"><a>any</a></Link>`, errors: [{ message: generateErrorText('a', 'href、もしくはto') }] },
  ],
})

ruleTester.run('a11y-anchor-has-href-attribute (dependencies: next)', requireRuleWithDependencies({ next: '*' }), {
  valid: [
    // next/Link直下のa要素はhref属性がなくてもOK
    { code: `<Link href="/foo"><a>any</a></Link>` },
  ],
  invalid: [
    // Link直下ではない要素はこれまでどおりチェックする
    { code: `<a>any</a>`, errors: [{ message: generateErrorText('a') }] },
    // Link以外の要素の直下のa要素も同様にチェックする
    { code: `<div><a>any</a></div>`, errors: [{ message: generateErrorText('a') }] },
    // to属性を許容するのはreact-routerを利用している場合のみ
    { code: `<Link to="/foo">any</Link>`, errors: [{ message: generateErrorText('Link') }] },
  ],
})

ruleTester.run('a11y-anchor-has-href-attribute (dependencies: next, react-router)', requireRuleWithDependencies({ next: '*', 'react-router': '*' }), {
  valid: [
    { code: `<Link to="/foo">any</Link>` },
    { code: `<Link href="/foo"><a>any</a></Link>` },
  ],
  invalid: [
    { code: `<Link>any</Link>`, errors: [{ message: generateErrorText('Link', 'href、もしくはto') }] },
  ],
})
