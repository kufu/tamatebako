const rule = require('../rules/best-practice-for-tailwind-variants')
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

ruleTester.run('best-practice-for-button-element', rule, {
  valid: [
    { code: `import { tv } from 'tailwind-variants'` },
    { code: `import { defaultConfig } from 'tailwind-variants'` },
    { code: `const classNameGenerator = tv()` },
    { code: `const xxxClassNameGenerator = tv()` },
    { code: `const hoge = useMemo(() => classNameGenerator(), [])` },
    { code: `const xxx = useMemo(() => hogeClassNameGenerator(), [])` },
  ],
  invalid: [
    { code: `import { tv as hoge } from 'tailwind-variants'`, errors: [ { message: `tailwind-variants をimportする際は、名称が"tv" となるようにしてください。例: "import { tv } from 'tailwind-variants'"` } ] },
    { code: `const hoge = tv()`, errors: [ { message: `tvの実行結果を格納する変数名は "hoge" ではなく "/(C|c)lassNameGenerator$/"にmatchする名称に統一してください。` } ] },
    { code: `const hoge = classNameGenerator()`, errors: [ { message: `"classNameGenerator" を実行する際、useMemoでラップし、メモ化してください` } ] },
    { code: `const hoge = hogeClassNameGenerator()`, errors: [ { message: `"hogeClassNameGenerator" を実行する際、useMemoでラップし、メモ化してください` } ] },
  ]
})
