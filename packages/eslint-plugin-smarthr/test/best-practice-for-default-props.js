const rule = require('../rules/best-practice-for-default-props')
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

ruleTester.run('best-practice-for-default-props', rule, {
  valid: [
    // デフォルト値と異なる値
    {
      code: '<Stack gap={2}>content</Stack>',
    },
    {
      code: '<Stack inline>content</Stack>',
    },
    {
      code: '<Cluster gap={1}>content</Cluster>',
    },
    {
      code: '<Cluster inline>content</Cluster>',
    },
    // デフォルト値が定義されていないprop
    {
      code: '<Stack align="center">content</Stack>',
    },
    // デフォルト値が定義されていないコンポーネント
    {
      code: '<Button size="default">Click</Button>',
    },
    // propなし
    {
      code: '<Stack>content</Stack>',
    },
    {
      code: '<Cluster>content</Cluster>',
    },
  ],

  invalid: [
    // Stack: inline={false}
    {
      code: '<Stack inline={false}>content</Stack>',
      output: '<Stack>content</Stack>',
      errors: [
        {
          messageId: 'redundantProp',
          data: { propName: 'inline', defaultValue: 'false' },
        },
      ],
    },
    // Stack: gap={1}
    {
      code: '<Stack gap={1}>content</Stack>',
      output: '<Stack>content</Stack>',
      errors: [
        {
          messageId: 'redundantProp',
          data: { propName: 'gap', defaultValue: '1' },
        },
      ],
    },
    // Stack: デフォルト値と非デフォルト値が混在
    {
      code: '<Stack inline={false} gap={2}>content</Stack>',
      output: '<Stack gap={2}>content</Stack>',
      errors: [
        {
          messageId: 'redundantProp',
          data: { propName: 'inline', defaultValue: 'false' },
        },
      ],
    },
    // Stack: 複数のデフォルト値（1回のfixで1つ削除される）
    {
      code: '<Stack inline={false} gap={1}>content</Stack>',
      output: '<Stack gap={1}>content</Stack>',
      errors: [
        {
          messageId: 'redundantProp',
          data: { propName: 'inline', defaultValue: 'false' },
        },
        {
          messageId: 'redundantProp',
          data: { propName: 'gap', defaultValue: '1' },
        },
      ],
    },
    // Cluster: inline={false}
    {
      code: '<Cluster inline={false}>content</Cluster>',
      output: '<Cluster>content</Cluster>',
      errors: [
        {
          messageId: 'redundantProp',
          data: { propName: 'inline', defaultValue: 'false' },
        },
      ],
    },
    // Cluster: gap={0.5}
    {
      code: '<Cluster gap={0.5}>content</Cluster>',
      output: '<Cluster>content</Cluster>',
      errors: [
        {
          messageId: 'redundantProp',
          data: { propName: 'gap', defaultValue: '0.5' },
        },
      ],
    },
    // 改行ありのフォーマット（複数のデフォルト値、1回のfixで1つ削除）
    {
      code: `<Stack
  inline={false}
  gap={1}
>
  content
</Stack>`,
      output: `<Stack
  gap={1}
>
  content
</Stack>`,
      errors: [
        {
          messageId: 'redundantProp',
        },
        {
          messageId: 'redundantProp',
        },
      ],
    },
  ],
})
