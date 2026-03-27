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
    { code: `<li>item</li>` },
    // as以外の属性がある場合は許容
    { code: `<Text as="p" weight="bold">content</Text>` },
    { code: `<Text as="p" className="custom">content</Text>` },
    { code: `<Text as="span" size="M">text</Text>` },
    { code: `<Text as="li" color="TEXT_BLACK">item</Text>` },
    // asがないが他の属性がある場合は許容
    { code: `<Text weight="bold">content</Text>` },
    { code: `<Text className="custom">content</Text>` },
    { code: `<Text size="M">text</Text>` },
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
      code: `<Text as="li">item</Text>`,
      errors: [{ message: `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<li>）に置き換えてください。
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
    // 属性なし
    {
      code: `<Text>content</Text>`,
      errors: [{ message: `属性を持たないTextコンポーネントは、<span>に置き換えるか、要素を削除してテキストのみにすることを検討してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-element
 - Textコンポーネントに属性がない場合、直接HTML要素を使用するか、不要な要素を削除することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください` }]
    },
    {
      code: `<Text>text</Text>`,
      errors: [{ message: `属性を持たないTextコンポーネントは、<span>に置き換えるか、要素を削除してテキストのみにすることを検討してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-element
 - Textコンポーネントに属性がない場合、直接HTML要素を使用するか、不要な要素を削除することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください` }]
    },
  ]
})
