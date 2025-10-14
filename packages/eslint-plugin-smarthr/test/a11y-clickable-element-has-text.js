const rule = require('../rules/a11y-clickable-element-has-text')
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
const defaultErrorMessage = `a, buttonなどのクリッカブルな要素内にはテキストを設定してください
 - 要素内にアイコン、画像のみを設置する場合はaltなどの代替テキスト用属性を指定してください
  - SVG component の場合、altを属性として受け取れるようにした上で '<svg role="img" aria-label={alt}>' のように指定してください
 - クリッカブルな要素内に設置しているコンポーネントがテキストを含んでいる場合、"XxxxText" のように末尾に "Text" もしくは "Message" という名称を設定してください`

ruleTester.run('a11y-clickable-element-has-text', rule, {
  valid: [
    {
      code: `<a>ほげ</a>`,
    },
    {
      code: `<Link>ほげ</Link>`,
    },
    {
      code: `<HogeLink>ほげ</HogeLink>`,
    },
    {
      code: `<Anchor>ほげ</Anchor>`,
    },
    {
      code: `<FugaAnchor>ほげ</FugaAnchor>`,
    },
    {
      code: `<AnchorButton>ほげ</AnchorButton>`,
    },
    {
      code: `<HogaAnchorButton>ほげ</HogaAnchorButton>`,
    },
    {
      code: `<Button>ほげ</Button>`,
    },
    {
      code: `<a />`,
    },
    {
      code: `<button />`,
    },
    {
      code: `<Anchor />`,
    },
    {
      code: `<Link />`,
    },
    {
      code: `<Button />`,
    },
    {
      code: `<HogeButton />`,
    },
    {
      code: `<a><span>ほげ</span></a>`,
    },
    {
      code: `<a><AnyComponent>ほげ</AnyComponent></a>`,
    },
    {
      code: `<a><img src="hoge.jpg" alt="ほげ" /></a>`,
    },
    {
      code: `<a>{any}</a>`,
    },
    {
      code: `<a><span>{any}</span></a>`,
    },
    {
      code: `<a><SmartHRLogo /></a>`,
    },
    {
      code: `<a><PrefixSmartHRLogo /></a>`,
    },
    {
      code: `<a><>ほげ</></a>`,
    },
    {
      code: `<a><svg role="img" aria-label="hoge" /></a>`,
    },
    {
      code: `<a><Text /></a>`,
    },
    {
      code: `<a><HogeText /></a>`,
    },
    {
      code: `<a><FormattedMessage /></a>`,
    },
    {
      code: `<button><Hoge text="any" /></button>`,
    },
    {
      code: `<a><AnyComponent /></a>`,
      options: [{
        componentsWithText: ['AnyComponent']
      }],
    },
  ],
  invalid: [
    {
      code: `<a><img src="hoge.jpg" /></a>`,
      errors: [{ message: defaultErrorMessage }]
    },
    {
      code: `<a><Any /></a>`,
      errors: [{ message: defaultErrorMessage }]
    },
    {
      code: `<a><span><Any /></span></a>`,
      errors: [{ message: defaultErrorMessage }]
    },
    {
      code: `<a><img src="hoge.jpg" alt="" /></a>`,
      errors: [{ message: defaultErrorMessage }]
    },
    {
      code: `<button><img src="hoge.jpg" /></button>`,
      errors: [{ message: defaultErrorMessage }]
    },
    {
      code: `<button><Any /></button>`,
      errors: [{ message: defaultErrorMessage }]
    },
    {
      code: `<button><span><Any /></span></button>`,
      errors: [{ message: defaultErrorMessage }]
    },
    {
      code: `<button><img src="hoge.jpg" alt="" /></button>`,
      errors: [{ message: defaultErrorMessage }]
    },
    {
      code: `<button><SmartHRLogoSuffix /></button>`,
      errors: [{ message: defaultErrorMessage }]
    },
    {
      code: `<a><TextWithHoge /></a>`,
      errors: [{ message: defaultErrorMessage }]
    },
    {
      code: `<a><AnyComponent /></a>`,
      options: [{
        componentsWithText: ['HogeComponent']
      }],
      errors: [{ message: defaultErrorMessage }]
    },
  ]
})
