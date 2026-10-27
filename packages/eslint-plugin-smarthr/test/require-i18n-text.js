const rule = require('../rules/require-i18n-text')
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

const attributeError = (element, attr, text) => `${element}の${attr}属性に文字列リテラル "${text}" が指定されています。多言語化対応のため、翻訳関数を使用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-i18n-text`
const childTextError = (text) => `子要素に文字列リテラル "${text}" が指定されています。多言語化対応のため、翻訳関数を使用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-i18n-text`

const options = [
  {
    elements: {
      img: ['alt', 'title'],
      div: ['title'],
      Button: ['label'],
    },
  },
]

ruleTester.run('require-i18n-text', rule, {
  valid: [
    // 翻訳関数を使用している場合
    { code: `<img alt={t('profile_picture')} />`, options },
    { code: `<div>{t('hello')}</div>`, options },

    // 検査対象外の属性
    { code: `<img src="test.png" />`, options },

    // 検査対象外の要素
    { code: `<Input label="test" />`, options },

    // 数値リテラル（検査対象外）
    { code: `<div>{123}</div>`, options },

    // 真偽値（検査対象外）
    { code: `<Button disabled={true} />`, options },

    // 空文字列（検査対象外）
    { code: `<img alt="" />`, options },

    // 空白のみのテキスト（検査対象外）
    { code: `<div>  </div>`, options },

    // デフォルト設定対象外の属性
    { code: `<img src="image.png" />` },
    { code: `<div data-testid="test" />` },

    // 数値のみ、.と演算記号のみの場合は許容
    { code: `<Any aria-label="1234" />` },
    { code: `<div>.</div>` },
    { code: `<a> +</a>` },
    { code: `<img alt="-" />` },
    { code: `<i>*</i>` },
    { code: `<i>/</i>` },
    { code: `<div>〜</div>` },
    { code: `<div>：</div>` },
    { code: `<div>:</div>` },
    { code: `<div>（</div>` },
    { code: `<div>）</div>` },
    { code: `<div>(</div>` },
    { code: `<div>)</div>` },
    { code: `<div>,</div>` },

    // ワイルドカード - 空配列で除外
    {
      code: `<Icon label="Icon text" />`,
      options: [
        {
          elements: {
            '*': ['label'],
            Icon: [],
          },
        },
      ],
    },

    // デフォルト設定の上書き
    {
      code: `<img alt="text" />`,
      options: [
        {
          elements: {
            '*': ['data-tooltip'],
          },
        },
      ],
    },

    // TemplateLiteral - 変数のみ
    { code: `<img alt={\`\${t('key')}\`} />`, options },
    { code: `<div title={\`\${i18n.t('title')}\`} />`, options },
    { code: `<Button label={\`\${label}\`} />`, options },
  ],
  invalid: [
    // 属性エラー: デフォルト設定
    {
      code: `<img alt="Profile picture" />`,
      errors: [{ message: attributeError('img', 'alt', 'Profile picture') }],
    },
    {
      code: `<CustomComponent aria-label="Label" />`,
      errors: [{ message: attributeError('CustomComponent', 'aria-label', 'Label') }],
    },
    {
      code: `<DefinitionListItem term="Label" />`,
      errors: [{ message: attributeError('DefinitionListItem', 'term', 'Label') }],
    },
    {
      code: `<button title="Click me" />`,
      errors: [{ message: attributeError('button', 'title', 'Click me') }],
    },

    // 数値、.と演算記号の場合でも他の文字列が含まれていればエラー
    { code: `<Any aria-label="1234 あ" />`, errors: [{ message: attributeError('Any', 'aria-label', '1234 あ') }] },
    { code: `<div>a.</div>`, errors: [{ message: childTextError('a.') }] },
    { code: `<a> + b</a>`, errors: [{ message: childTextError('+ b') }] },
    { code: `<img alt="-zod" />`, errors: [{ message: attributeError('img', 'alt', '-zod') }] },
    { code: `<i>*1</i>`, errors: [{ message: childTextError('*1') }] },
    { code: `<i>a/</i>`, errors: [{ message: childTextError('a/') }] },

    // 属性エラー: カスタムオプション
    {
      code: `<img alt="Profile picture" />`,
      options,
      errors: [{ message: attributeError('img', 'alt', 'Profile picture') }],
    },

    // 属性エラー: 同一要素の複数属性
    {
      code: `<img alt="Profile" title="User profile" />`,
      options,
      errors: [{ message: attributeError('img', 'alt', 'Profile') }, { message: attributeError('img', 'title', 'User profile') }],
    },

    // 属性エラー: ワイルドカード
    {
      code: `<CustomComponent label="Text" />`,
      options: [
        {
          elements: {
            '*': ['label'],
          },
        },
      ],
      errors: [{ message: attributeError('CustomComponent', 'label', 'Text') }],
    },

    // 属性エラー: 個別設定がワイルドカードより優先
    {
      code: `<Button label="Submit" helperText="Help" />`,
      options: [
        {
          elements: {
            '*': ['label'],
            Button: ['label', 'helperText'],
          },
        },
      ],
      errors: [{ message: attributeError('Button', 'label', 'Submit') }, { message: attributeError('Button', 'helperText', 'Help') }],
    },

    // 子要素エラー（オプション未設定時でもチェックされる）
    {
      code: `<div>Hello World</div>`,
      errors: [{ message: childTextError('Hello World') }],
    },

    // 複合エラー: 属性と子要素
    {
      code: `<Button label="Submit">Click here</Button>`,
      options,
      errors: [{ message: attributeError('Button', 'label', 'Submit') }, { message: childTextError('Click here') }],
    },

    // 複合エラー: 入れ子構造
    {
      code: `<div title="Parent"><Button label="Child">Grandchild text</Button></div>`,
      options,
      errors: [
        { message: attributeError('div', 'title', 'Parent') },
        { message: attributeError('Button', 'label', 'Child') },
        { message: childTextError('Grandchild text') },
      ],
    },
  ],
})
