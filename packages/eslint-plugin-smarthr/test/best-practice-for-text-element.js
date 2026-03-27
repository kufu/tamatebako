const rule = require('../rules/best-practice-for-text-element')
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

const ERROR_MESSAGE = `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<p>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-element
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`

ruleTester.run('best-practice-for-text-element', rule, {
  valid: [
    // ネイティブHTML要素
    { code: `<p>content</p>` },
    { code: `<span>text</span>` },
    { code: `<h1>title</h1>` },
    // as以外の属性がある場合は許容
    { code: `<Text as="p" weight="bold">content</Text>` },
    { code: `<Text as="p" className="custom">content</Text>` },
    { code: `<Text as="span" size="M">text</Text>` },
    { code: `<Text as="h1" color="TEXT_BLACK">title</Text>` },
    // asがない場合
    { code: `<Text>content</Text>` },
    { code: `<Text weight="bold">content</Text>` },
  ],
  invalid: [
    // as属性のみ
    {
      code: `<Text as="p">content</Text>`,
      errors: [{ message: ERROR_MESSAGE }]
    },
    {
      code: `<Text as="span">text</Text>`,
      errors: [{ message: `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-element
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください` }]
    },
    {
      code: `<Text as="h1">title</Text>`,
      errors: [{ message: `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<h1>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-element
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください` }]
    },
    {
      code: `<Text as="div">content</Text>`,
      errors: [{ message: `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<div>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-element
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください` }]
    },
  ]
})
