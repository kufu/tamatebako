const rule = require('../rules/best-practice-for-text-component')
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

const ERROR_MESSAGE_AS_ONLY_P = `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<p>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`

const ERROR_MESSAGE_NO_ATTR = `属性を持たないTextコンポーネントは、<span>に置き換えるか、要素を削除してテキストのみにすることを検討してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントに属性がない場合、直接HTML要素を使用するか、不要な要素を削除することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`

ruleTester.run('best-practice-for-text-component', rule, {
  valid: [
    // ネイティブHTML要素
    { code: `<p>content</p>` },
    { code: `<span>text</span>` },
    { code: `<li>item</li>` },
    // Textのスタイリング属性がある場合は許容
    { code: `<Text as="p" weight="bold">content</Text>` },
    { code: `<Text as="span" size="M">text</Text>` },
    { code: `<Text as="li" color="TEXT_BLACK">item</Text>` },
    { code: `<Text weight="bold">content</Text>` },
    { code: `<Text size="M">text</Text>` },
    { code: `<Text leading="TIGHT">text</Text>` },
    { code: `<Text italic>text</Text>` },
    { code: `<Text whiteSpace="nowrap">text</Text>` },
    { code: `<Text maxLines={2}>text</Text>` },
    { code: `<Text styleType="blockTitle">text</Text>` },
    { code: `<Text icon={<Icon />}>text</Text>` },
    // Textのスタイリング属性 + className（変換不可能なクラスのみ）
    { code: `<Text size="M" className="custom">text</Text>` },
    { code: `<Text weight="bold" className="custom-class">text</Text>` },
    // className が変数や式の場合は静的解析できないのでスキップ
    { code: `<Text className={customClass}>text</Text>` },
    { code: `<Text className={\`custom-\${type}\`}>text</Text>` },
    { code: `<Text as="p" className={customClass}>text</Text>` },
    { code: `<Text size="M" className={customClass}>text</Text>` },
  ],
  invalid: [
    // as属性のみ
    {
      code: `<Text as="p">content</Text>`,
      errors: [{ message: ERROR_MESSAGE_AS_ONLY_P }]
    },
    {
      code: `<Text as="span">text</Text>`,
      errors: [{ message: `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください` }]
    },
    {
      code: `<Text as="li">item</Text>`,
      errors: [{ message: `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<li>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください` }]
    },
    {
      code: `<Text as="div">content</Text>`,
      errors: [{ message: `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<div>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください` }]
    },
    // 属性なし
    {
      code: `<Text>content</Text>`,
      errors: [{ message: `属性を持たないTextコンポーネントは、<span>に置き換えるか、要素を削除してテキストのみにすることを検討してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントに属性がない場合、直接HTML要素を使用するか、不要な要素を削除することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください` }]
    },
    {
      code: `<Text>text</Text>`,
      errors: [{ message: `属性を持たないTextコンポーネントは、<span>に置き換えるか、要素を削除してテキストのみにすることを検討してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントに属性がない場合、直接HTML要素を使用するか、不要な要素を削除することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください` }]
    },
    // パターン1-3: classNameのみ（変換不可能なクラスのみ）
    {
      code: `<Text className="custom">content</Text>`,
      errors: [{ message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <span className="custom">
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります` }]
    },
    {
      code: `<Text className="custom-class another-class">text</Text>`,
      errors: [{ message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <span className="custom-class another-class">
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります` }]
    },
    // パターン1-4: className + as（変換不可能なクラスのみ）
    {
      code: `<Text as="p" className="custom">content</Text>`,
      errors: [{ message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<p>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <p className="custom">
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります` }]
    },
    {
      code: `<Text as="div" className="wrapper">content</Text>`,
      errors: [{ message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<div>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <div className="wrapper">
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります` }]
    },
    // パターン2-1: classNameのみ（すべて変換可能）
    {
      code: `<Text className="shr-text-sm">text</Text>`,
      errors: [{ message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text size="S">
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります` }]
    },
    {
      code: `<Text className="shr-text-sm shr-font-bold">text</Text>`,
      errors: [{ message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text size="S" weight="bold">
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります` }]
    },
    {
      code: `<Text className="shr-text-lg shr-font-bold shr-text-grey">text</Text>`,
      errors: [{ message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text size="L" weight="bold" color="TEXT_GREY">
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります` }]
    },
    // パターン2-2: className + as（すべて変換可能）
    {
      code: `<Text as="p" className="shr-text-sm">text</Text>`,
      errors: [{ message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text as="p" size="S">
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります` }]
    },
    {
      code: `<Text as="p" className="shr-text-sm shr-font-bold">text</Text>`,
      errors: [{ message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text as="p" size="S" weight="bold">
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります` }]
    },
    // パターン2-3: 一部のみ変換可能
    {
      code: `<Text className="shr-text-sm custom-class">text</Text>`,
      errors: [{ message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text size="S" className="custom-class">
 - 変換可能なクラス: shr-text-sm
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります` }]
    },
    {
      code: `<Text as="p" className="shr-text-sm custom-class">text</Text>`,
      errors: [{ message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text as="p" size="S" className="custom-class">
 - 変換可能なクラス: shr-text-sm
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります` }]
    },
    {
      code: `<Text className="shr-text-lg shr-font-bold custom-one custom-two">text</Text>`,
      errors: [{ message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text size="L" weight="bold" className="custom-one custom-two">
 - 変換可能なクラス: shr-text-lg, shr-font-bold
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります` }]
    },
    // パターン3: 属性とclassNameの矛盾
    {
      code: `<Text size="M" className="shr-text-sm">text</Text>`,
      errors: [{ message: `Textコンポーネントの属性とclassNameで矛盾する指定があります。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 変換可能なクラス: shr-text-sm
 - Textコンポーネントの属性（size、weight、color等）とclassNameのshr-プレフィックスのクラスを同時に使用すると、意図しない挙動になる可能性があります
 - どちらか一方のみを使用してください` }]
    },
    {
      code: `<Text weight="bold" className="shr-font-normal">text</Text>`,
      errors: [{ message: `Textコンポーネントの属性とclassNameで矛盾する指定があります。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 変換可能なクラス: shr-font-normal
 - Textコンポーネントの属性（size、weight、color等）とclassNameのshr-プレフィックスのクラスを同時に使用すると、意図しない挙動になる可能性があります
 - どちらか一方のみを使用してください` }]
    },
    {
      code: `<Text size="L" className="shr-text-sm shr-font-bold">text</Text>`,
      errors: [{ message: `Textコンポーネントの属性とclassNameで矛盾する指定があります。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 変換可能なクラス: shr-text-sm, shr-font-bold
 - Textコンポーネントの属性（size、weight、color等）とclassNameのshr-プレフィックスのクラスを同時に使用すると、意図しない挙動になる可能性があります
 - どちらか一方のみを使用してください` }]
    },
    {
      code: `<Text size="M" className="shr-text-sm custom-class">text</Text>`,
      errors: [{ message: `Textコンポーネントの属性とclassNameで矛盾する指定があります。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 変換可能なクラス: shr-text-sm
 - Textコンポーネントの属性（size、weight、color等）とclassNameのshr-プレフィックスのクラスを同時に使用すると、意図しない挙動になる可能性があります
 - どちらか一方のみを使用してください` }]
    },
  ]
})
