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

const ERROR_NO_ATTRS = `属性を持たないTextコンポーネントは、<span>に置き換えるか、要素を削除してテキストのみにすることを検討してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントに属性がない場合、直接HTML要素を使用するか、不要な要素を削除することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`

const errorAsOnly = (tag) => `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<${tag}>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`

const errorUnnecessaryClassName = (className) => `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <span className="${className}">
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`

const errorUnnecessaryAsClassName = (tag) => `Textコンポーネントの機能を使用していないため、ネイティブHTML要素に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - <${tag}>要素にclassNameを移動してください
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`

const errorConvertibleShr = (suggestion, convertible, as = null) => `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text${as ? ` as="${as}"` : ''} ${suggestion}>
 - 変換可能なクラス: ${convertible}
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります`

const errorConflictingProps = (convertible) => `Textコンポーネントの属性とclassNameで矛盾する指定があります。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 変換可能なクラス: ${convertible}
 - Textコンポーネントの属性（size、weight、color等）とclassNameのshr-プレフィックスのクラスを同時に使用すると、意図しない挙動になる可能性があります
 - どちらか一方のみを使用してください`

ruleTester.run('best-practice-for-text-component', rule, {
  valid: [
    // ネイティブHTML要素
    { code: `<p>content</p>` },
    { code: `<span>text</span>` },
    // Textのスタイリング属性がある場合は許容
    { code: `<Text weight="bold">content</Text>` },
    { code: `<Text size="M">text</Text>` },
    { code: `<Text color="TEXT_GREY">text</Text>` },
    { code: `<Text leading="TIGHT">text</Text>` },
    { code: `<Text italic>text</Text>` },
    { code: `<Text whiteSpace="nowrap">text</Text>` },
    { code: `<Text maxLines={2}>text</Text>` },
    { code: `<Text styleType="blockTitle">text</Text>` },
    { code: `<Text icon={<Icon />}>text</Text>` },
    // as + スタイリング属性
    { code: `<Text as="p" weight="bold">content</Text>` },
    // Textのスタイリング属性 + className（変換不可能なクラスのみ）
    { code: `<Text size="M" className="custom">text</Text>` },
    // className が変数や式の場合は静的解析できないのでスキップ
    { code: `<Text className={customClass}>text</Text>` },
    { code: `<Text className={\`custom-\${type}\`}>text</Text>` },
    { code: `<Text as="p" className={customClass}>text</Text>` },
    { code: `<Text size="M" className={customClass}>text</Text>` },
    // as が変数の場合
    { code: `<Text as={component}>text</Text>` },
  ],
  invalid: [
    // パターン1-1: 属性なし
    { code: `<Text>content</Text>`, errors: [{ message: ERROR_NO_ATTRS }] },

    // パターン1-2: as属性のみ
    { code: `<Text as="p">content</Text>`, output: `<p>content</p>`, errors: [{ message: errorAsOnly('p') }] },
    { code: `<Text as="div">content</Text>`, output: `<div>content</div>`, errors: [{ message: errorAsOnly('div') }] },
    { code: `<Text as="p">
      nested content
    </Text>`, output: `<p>
      nested content
    </p>`, errors: [{ message: errorAsOnly('p') }] },

    // パターン1-3: classNameのみ（変換不可能なクラスのみ）
    { code: `<Text className="custom">content</Text>`, output: `<span className="custom">content</span>`, errors: [{ message: errorUnnecessaryClassName('custom') }] },
    { code: `<Text className="custom-class another-class">text</Text>`, output: `<span className="custom-class another-class">text</span>`, errors: [{ message: errorUnnecessaryClassName('custom-class another-class') }] },
    { code: `<Text className="custom"><span>nested</span></Text>`, output: `<span className="custom"><span>nested</span></span>`, errors: [{ message: errorUnnecessaryClassName('custom') }] },

    // パターン1-4: className + as（変換不可能なクラスのみ）
    { code: `<Text as="p" className="custom">content</Text>`, output: `<p className="custom">content</p>`, errors: [{ message: errorUnnecessaryAsClassName('p') }] },

    // パターン2-1: classNameのみ（すべて変換可能）
    { code: `<Text className="shr-text-sm">text</Text>`, output: `<Text size="S">text</Text>`, errors: [{ message: errorConvertibleShr('size="S"', 'shr-text-sm') }] },
    { code: `<Text className="shr-text-sm shr-font-bold">text</Text>`, output: `<Text size="S" weight="bold">text</Text>`, errors: [{ message: errorConvertibleShr('size="S" weight="bold"', 'shr-text-sm, shr-font-bold') }] },
    { code: `<Text className="shr-text-lg shr-font-bold shr-text-grey">text</Text>`, output: `<Text size="L" weight="bold" color="TEXT_GREY">text</Text>`, errors: [{ message: errorConvertibleShr('size="L" weight="bold" color="TEXT_GREY"', 'shr-text-lg, shr-font-bold, shr-text-grey') }] },

    // パターン2-2: className + as（すべて変換可能）
    { code: `<Text as="p" className="shr-text-sm">text</Text>`, output: `<Text as="p" size="S">text</Text>`, errors: [{ message: errorConvertibleShr('size="S"', 'shr-text-sm', 'p') }] },
    { code: `<Text as="p" className="shr-text-sm shr-font-bold">text</Text>`, output: `<Text as="p" size="S" weight="bold">text</Text>`, errors: [{ message: errorConvertibleShr('size="S" weight="bold"', 'shr-text-sm, shr-font-bold', 'p') }] },

    // パターン2-3: 一部のみ変換可能
    { code: `<Text className="shr-text-sm custom-class">text</Text>`, output: `<Text size="S" className="custom-class">text</Text>`, errors: [{ message: errorConvertibleShr('size="S" className="custom-class"', 'shr-text-sm') }] },
    { code: `<Text as="p" className="shr-text-sm custom-class">text</Text>`, output: `<Text as="p" size="S" className="custom-class">text</Text>`, errors: [{ message: errorConvertibleShr('size="S" className="custom-class"', 'shr-text-sm', 'p') }] },
    { code: `<Text className="shr-text-lg shr-font-bold custom-one custom-two">text</Text>`, output: `<Text size="L" weight="bold" className="custom-one custom-two">text</Text>`, errors: [{ message: errorConvertibleShr('size="L" weight="bold" className="custom-one custom-two"', 'shr-text-lg, shr-font-bold') }] },

    // パターン3: 属性とclassNameの矛盾
    { code: `<Text size="M" className="shr-text-sm">text</Text>`, errors: [{ message: errorConflictingProps('shr-text-sm') }] },
    { code: `<Text weight="bold" className="shr-font-normal">text</Text>`, errors: [{ message: errorConflictingProps('shr-font-normal') }] },
    { code: `<Text size="L" className="shr-text-sm shr-font-bold">text</Text>`, errors: [{ message: errorConflictingProps('shr-text-sm, shr-font-bold') }] },
    { code: `<Text size="M" className="shr-text-sm custom-class">text</Text>`, errors: [{ message: errorConflictingProps('shr-text-sm') }] },

    // 追加テスト: 各クラスの網羅性確認
    { code: `<Text className="shr-text-2xs">text</Text>`, output: `<Text size="XXS">text</Text>`, errors: [{ message: errorConvertibleShr('size="XXS"', 'shr-text-2xs') }] },
    { code: `<Text className="shr-text-2xl">text</Text>`, output: `<Text size="XXL">text</Text>`, errors: [{ message: errorConvertibleShr('size="XXL"', 'shr-text-2xl') }] },
    { code: `<Text className="shr-leading-none">text</Text>`, output: `<Text leading="NONE">text</Text>`, errors: [{ message: errorConvertibleShr('leading="NONE"', 'shr-leading-none') }] },
    { code: `<Text className="shr-text-white">text</Text>`, output: `<Text color="TEXT_WHITE">text</Text>`, errors: [{ message: errorConvertibleShr('color="TEXT_WHITE"', 'shr-text-white') }] },
    { code: `<Text className="shr-text-color-inherit">text</Text>`, output: `<Text color="inherit">text</Text>`, errors: [{ message: errorConvertibleShr('color="inherit"', 'shr-text-color-inherit') }] },

    // 追加テスト: 未知の属性が保持されることを確認
    { code: `<Text className="custom" id="foo">text</Text>`, output: `<span className="custom" id="foo">text</span>`, errors: [{ message: errorUnnecessaryClassName('custom') }] },
    { code: `<Text as="p" className="custom" id="foo">text</Text>`, output: `<p className="custom" id="foo">text</p>`, errors: [{ message: errorUnnecessaryAsClassName('p') }] },
    { code: `<Text id="foo" className="shr-text-sm">text</Text>`, output: `<Text size="S" id="foo">text</Text>`, errors: [{ message: errorConvertibleShr('size="S"', 'shr-text-sm') }] },
    { code: `<Text id="foo" className="shr-text-sm custom">text</Text>`, output: `<Text size="S" id="foo" className="custom">text</Text>`, errors: [{ message: errorConvertibleShr('size="S" className="custom"', 'shr-text-sm') }] },
    { code: `<Text as="p" id="foo" className="shr-text-sm">text</Text>`, output: `<Text as="p" size="S" id="foo">text</Text>`, errors: [{ message: errorConvertibleShr('size="S"', 'shr-text-sm', 'p') }] },
    { code: `<Text as="p" id="foo" onClick={handler} className="shr-text-sm custom">text</Text>`, output: `<Text as="p" size="S" id="foo" onClick={handler} className="custom">text</Text>`, errors: [{ message: errorConvertibleShr('size="S" className="custom"', 'shr-text-sm', 'p') }] },
  ]
})
