const rule = require('../rules/design-system-guideline-prohibit-input-affix-interactive-element')
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

const EXCLUSIVE_MESSAGE = `InputコンポーネントにsuffixとsubActionAreaを同時に指定することはできません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-prohibit-input-affix-interactive-element
 - suffixは装飾用、subActionAreaは操作用の要素を配置するためのpropsです
 - いずれか一方のみを指定してください`

const INTERACTIVE_ELEMENT_MESSAGE = `Inputコンポーネントのprefix/suffixに操作可能な要素を配置することはできません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-prohibit-input-affix-interactive-element
 - prefix/suffixは装飾用のpropsです。ButtonやRemoteDialogTriggerなどの操作可能なコンポーネント、onXxxxやhandleXxxxといったハンドラ属性を持つ要素はsubActionAreaに配置してください`

ruleTester.run('design-system-guideline-prohibit-input-affix-interactive-element', rule, {
  valid: [
    // suffixのみ: 装飾用要素
    { code: `<Input suffix={<Icon name="search" />} />` },
    { code: `<Input suffix="円" />` },
    { code: `<Input suffix={unit} />` },

    // prefixのみ: 装飾用要素
    { code: `<Input prefix={<Icon name="search" />} />` },
    { code: `<Input prefix="¥" />` },

    // subActionAreaのみ: 操作用要素
    { code: `<Input subActionArea={<Button>クリア</Button>} />` },
    { code: `<Input subActionArea={<RemoteDialogTrigger targetId="dialog">開く</RemoteDialogTrigger>} />` },

    // prefixとsubActionAreaの同時指定は許容
    { code: `<Input prefix={<Icon name="search" />} subActionArea={<Button>クリア</Button>} />` },

    // prefix/suffix内に非操作要素(div/span)でハンドラ属性を持たない場合
    { code: `<Input suffix={<div>円</div>} />` },
    { code: `<Input prefix={<span className="unit">%</span>} />` },

    // 拡張コンポーネント名でもsuffix/subActionArea以外は対象外
    { code: `<MyInput prefix={<Icon name="search" />} />` },

    // Input以外のコンポーネントは対象外
    { code: `<Textarea suffix={<Button>クリア</Button>} subActionArea={<Button>クリア</Button>} />` },
  ],
  invalid: [
    // suffixとsubActionAreaの同時指定
    {
      code: `<Input suffix={<Icon name="search" />} subActionArea={<Button>クリア</Button>} />`,
      errors: [{ message: EXCLUSIVE_MESSAGE }],
    },
    {
      code: `<FugaInput suffix="円" subActionArea={<Button>クリア</Button>} />`,
      errors: [{ message: EXCLUSIVE_MESSAGE }],
    },

    // suffix内に操作可能なコンポーネント
    {
      code: `<Input suffix={<Button>クリア</Button>} />`,
      errors: [{ message: INTERACTIVE_ELEMENT_MESSAGE }],
    },
    {
      code: `<Input suffix={<RemoteDialogTrigger targetId="dialog">開く</RemoteDialogTrigger>} />`,
      errors: [{ message: INTERACTIVE_ELEMENT_MESSAGE }],
    },
    {
      code: `<Input suffix={<Anchor href="/">リンク</Anchor>} />`,
      errors: [{ message: INTERACTIVE_ELEMENT_MESSAGE }],
    },

    // prefix内に操作可能なコンポーネント
    {
      code: `<Input prefix={<Button>検索</Button>} />`,
      errors: [{ message: INTERACTIVE_ELEMENT_MESSAGE }],
    },
    {
      code: `<Input prefix={<RemoteDialogTrigger targetId="dialog">開く</RemoteDialogTrigger>} />`,
      errors: [{ message: INTERACTIVE_ELEMENT_MESSAGE }],
    },

    // suffix内にハンドラ属性を持つ要素
    {
      code: `<Input suffix={<div onClick={handleClick}>×</div>} />`,
      errors: [{ message: INTERACTIVE_ELEMENT_MESSAGE }],
    },
    {
      code: `<Input suffix={<span handleClear={clear}>×</span>} />`,
      errors: [{ message: INTERACTIVE_ELEMENT_MESSAGE }],
    },
    {
      code: `<Input suffix={<span onMouseDown={onMouseDown}>×</span>} />`,
      errors: [{ message: INTERACTIVE_ELEMENT_MESSAGE }],
    },

    // prefix内にハンドラ属性を持つ要素
    {
      code: `<Input prefix={<div onClick={handleClick}>検索</div>} />`,
      errors: [{ message: INTERACTIVE_ELEMENT_MESSAGE }],
    },
    {
      code: `<Input prefix={<span handleSearch={search}>検索</span>} />`,
      errors: [{ message: INTERACTIVE_ELEMENT_MESSAGE }],
    },
  ],
})
