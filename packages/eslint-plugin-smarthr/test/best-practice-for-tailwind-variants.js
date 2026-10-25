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

    // module scope(トップレベル)での直接呼び出しはuseMemo不要
    { code: `export const visuallyHiddenTextClassName = visuallyHiddenTextClassNameGenerator()` },
    { code: `const { triggerWrapper, triggerButton, actionList, actionListItemButton } = classNameGenerator()` },

    // module scope内のIIFEもuseMemo不要
    { code: `const CLASS_NAMES = (() => { const hoge = classNameGenerator(); return hoge })()` },
    { code: `const CLASS_NAMES = (function () { return classNameGenerator() })()` },
  ],
  invalid: [
    { code: `import { tv as hoge } from 'tailwind-variants'`, errors: [ { message: `tailwind-variants をimportする際は、名称が"tv" となるようにしてください。例: "import { tv } from 'tailwind-variants'"
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-variants` } ] },
    { code: `const hoge = tv()`, errors: [ { message: `tvの実行結果を格納する変数名は "hoge" ではなく "/(C|c)lassNameGenerator$/"にmatchする名称に統一してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-variants` } ] },
    { code: `const Component = () => { const hoge = classNameGenerator(); return hoge }`, errors: [ { message: `"classNameGenerator" を実行する際、useMemoでラップし、メモ化してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-variants` } ] },
    { code: `const Component = () => { const hoge = hogeClassNameGenerator(); return hoge }`, errors: [ { message: `"hogeClassNameGenerator" を実行する際、useMemoでラップし、メモ化してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-variants` } ] },
  ]
})
