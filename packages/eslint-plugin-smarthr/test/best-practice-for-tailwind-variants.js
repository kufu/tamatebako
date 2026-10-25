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
    { code: `const className = useMemo(() => classNameGenerator(), [])` },
    { code: `const hogeClassName = useMemo(() => hogeClassNameGenerator(), [])` },

    // module scope(トップレベル)での直接呼び出しはuseMemo不要
    { code: `export const visuallyHiddenTextClassName = visuallyHiddenTextClassNameGenerator()` },
    { code: `const { triggerWrapper, triggerButton, actionList, actionListItemButton } = classNameGenerator()` },

    // module scope内のIIFEもuseMemo不要
    { code: `const CLASS_NAMES = (() => { const className = classNameGenerator(); return className })()` },
    { code: `const CLASS_NAMES = (function () { return classNameGenerator() })()` },

    // module scope内のIIFE + 分割代入 + 個別呼び出しの組み合わせ
    {
      code: `const CLASS_NAMES = (() => {
        const { wrapper, actionArea, buttonArea, message } = dialogContentClassNameGenerator()
        return {
          wrapper: wrapper(),
          actionArea: actionArea(),
          buttonArea: buttonArea(),
          message: message(),
        }
      })()`,
    },

    // 実行結果を格納する変数名: camelCase
    { code: `const className = classNameGenerator()` },
    { code: `const classNames = classNameGenerator()` },
    { code: `const buttonClassName = classNameGenerator()` },
    { code: `const buttonClassNames = classNameGenerator()` },
    { code: `const buttonClassName = useMemo(() => classNameGenerator(), [])` },

    // 実行結果を格納する変数名: 定数(SCREAMING_SNAKE_CASE)
    { code: `const CLASS_NAME = classNameGenerator()` },
    { code: `const CLASS_NAMES = classNameGenerator()` },
    { code: `const BUTTON_CLASS_NAME = classNameGenerator()` },
    { code: `const BUTTON_CLASS_NAMES = classNameGenerator()` },
    { code: `const CLASS_NAMES = useMemo(() => classNameGenerator(), [])` },
  ],
  invalid: [
    { code: `import { tv as hoge } from 'tailwind-variants'`, errors: [ { message: `tailwind-variants をimportする際は、名称が"tv" となるようにしてください。例: "import { tv } from 'tailwind-variants'"
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-variants` } ] },
    { code: `const hoge = tv()`, errors: [ { message: `tvの実行結果を格納する変数名は "hoge" ではなく "/(C|c)lassNameGenerator$/"にmatchする名称に統一してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-variants` } ] },
    { code: `const Component = () => { const className = classNameGenerator(); return className }`, errors: [ { message: `"classNameGenerator" を実行する際、useMemoでラップし、メモ化してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-variants` } ] },
    { code: `const Component = () => { const hogeClassName = hogeClassNameGenerator(); return hogeClassName }`, errors: [ { message: `"hogeClassNameGenerator" を実行する際、useMemoでラップし、メモ化してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-variants` } ] },

    // 実行結果を格納する変数名が規約に沿っていない
    { code: `const hoge = classNameGenerator()`, errors: [ { message: `"classNameGenerator"の実行結果を格納する変数名は "hoge" ではなく "/((C|c)lassNames?|CLASS_NAMES?)$/"にmatchする名称に統一してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-variants` } ] },
    { code: `const hoge = useMemo(() => classNameGenerator(), [])`, errors: [ { message: `"classNameGenerator"の実行結果を格納する変数名は "hoge" ではなく "/((C|c)lassNames?|CLASS_NAMES?)$/"にmatchする名称に統一してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-variants` } ] },
    { code: `const HOGE = useMemo(() => classNameGenerator(), [])`, errors: [ { message: `"classNameGenerator"の実行結果を格納する変数名は "HOGE" ではなく "/((C|c)lassNames?|CLASS_NAMES?)$/"にmatchする名称に統一してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-variants` } ] },
  ]
})
