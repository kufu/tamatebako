const rule = require('../rules/design-system-guideline-prohibit-double-icons')
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
const generateErrorText = (name) => `${name} には prefix と suffix は同時に設定できません。
 - どちらにもアイコンをつけられそうな場合は、prefixを優先してください。`

ruleTester.run('design-system-guideline-prohibit-double-icons', rule, {
  valid: [
    { code: `<Button>hoge</Button>` },
    { code: `<Button suffix={SUFFIX}>hoge</Button>` },
    { code: `<Button prefix="PREFIX">hoge</Button>` },
    { code: `<TextLink>hoge</TextLink>` },
    { code: `<TextLink suffix="SUFFIX">hoge</TextLink>` },
    { code: `<TextLink prefix={PREFIX}>hoge</TextLink>` },
    { code: `<StyledButton>hoge</StyledButton>` },
    { code: `<StyledLink>hoge</StyledLink>` },
    { code: `<Input prefix={PREFIX} suffix={SUFFIX} />` },
  ],
  invalid: [
    { code: `<Button suffix={SUFFIX} prefix={PREFIX}>hoge</Button>`, errors: [{message: generateErrorText('Button')}]},
    { code: `<Button suffix prefix>hoge</Button>`, errors: [{message: generateErrorText('Button')}]},
    { code: `<StyledButton suffix={undefined} prefix={null}>hoge</StyledButton>`, errors: [{message: generateErrorText('StyledButton')}]},
    { code: `<Link prefix="PREFIX" suffix="SUFFIX">hoge</Link>`, errors: [{message: generateErrorText('Link')}]},
    { code: `<StyledLink prefix="PREFIX" suffix="SUFFIX">hoge</StyledLink>`, errors: [{message: generateErrorText('StyledLink')}]},
  ]
})
