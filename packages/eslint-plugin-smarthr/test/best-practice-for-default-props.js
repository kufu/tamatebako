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
    {
      code: '<Reel gap={1}>content</Reel>',
    },
    {
      code: '<Reel padding={1}>content</Reel>',
    },
    {
      code: '<Sidebar align="start">content</Sidebar>',
    },
    {
      code: '<Sidebar contentsMinWidth="30%">content</Sidebar>',
    },
    {
      code: '<Sidebar gap={2}>content</Sidebar>',
    },
    {
      code: '<Sidebar right>content</Sidebar>',
    },
    {
      code: '<Heading type="screenTitle">Title</Heading>',
    },
    {
      code: '<Button type="submit">Click</Button>',
    },
    {
      code: '<Button size="S">Click</Button>',
    },
    {
      code: '<Button wide>Click</Button>',
    },
    {
      code: '<Button variant="primary">Click</Button>',
    },
    {
      code: '<Button loading>Click</Button>',
    },
    // デフォルト値が定義されていないprop
    {
      code: '<Stack align="center">content</Stack>',
    },
    // デフォルト値が定義されていないコンポーネント
    {
      code: '<Input size="default" />',
    },
    // propなし
    {
      code: '<Stack>content</Stack>',
    },
    {
      code: '<Cluster>content</Cluster>',
    },
    {
      code: '<Reel>content</Reel>',
    },
    {
      code: '<Sidebar>content</Sidebar>',
    },
    {
      code: '<Heading>Title</Heading>',
    },
    {
      code: '<Button>Click</Button>',
    },
  ],

  invalid: [
    // Stack: inline={false}
    {
      code: '<Stack inline={false}>content</Stack>',
      output: '<Stack>content</Stack>',
      errors: [
        {
          message: /prop "inline" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Stack: gap={1}
    {
      code: '<Stack gap={1}>content</Stack>',
      output: '<Stack>content</Stack>',
      errors: [
        {
          message: /prop "gap" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Stack: デフォルト値と非デフォルト値が混在
    {
      code: '<Stack inline={false} gap={2}>content</Stack>',
      output: '<Stack gap={2}>content</Stack>',
      errors: [
        {
          message: /prop "inline" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Stack: 複数のデフォルト値
    {
      code: '<Stack inline={false} gap={1}>content</Stack>',
      output: '<Stack gap={1}>content</Stack>',
      errors: [
        {
          message: /prop "inline" はデフォルト値と同じため不要です/,
        },
        {
          message: /prop "gap" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Cluster: inline={false}
    {
      code: '<Cluster inline={false}>content</Cluster>',
      output: '<Cluster>content</Cluster>',
      errors: [
        {
          message: /prop "inline" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Cluster: gap={0.5}
    {
      code: '<Cluster gap={0.5}>content</Cluster>',
      output: '<Cluster>content</Cluster>',
      errors: [
        {
          message: /prop "gap" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Reel: gap={0.5}
    {
      code: '<Reel gap={0.5}>content</Reel>',
      output: '<Reel>content</Reel>',
      errors: [
        {
          message: /prop "gap" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Reel: padding={0}
    {
      code: '<Reel padding={0}>content</Reel>',
      output: '<Reel>content</Reel>',
      errors: [
        {
          message: /prop "padding" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Sidebar: align="stretch"
    {
      code: '<Sidebar align="stretch">content</Sidebar>',
      output: '<Sidebar>content</Sidebar>',
      errors: [
        {
          message: /prop "align" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Sidebar: contentsMinWidth="50%"
    {
      code: '<Sidebar contentsMinWidth="50%">content</Sidebar>',
      output: '<Sidebar>content</Sidebar>',
      errors: [
        {
          message: /prop "contentsMinWidth" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Sidebar: gap={1}
    {
      code: '<Sidebar gap={1}>content</Sidebar>',
      output: '<Sidebar>content</Sidebar>',
      errors: [
        {
          message: /prop "gap" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Sidebar: right={false}
    {
      code: '<Sidebar right={false}>content</Sidebar>',
      output: '<Sidebar>content</Sidebar>',
      errors: [
        {
          message: /prop "right" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Heading: type="sectionTitle"
    {
      code: '<Heading type="sectionTitle">Title</Heading>',
      output: '<Heading>Title</Heading>',
      errors: [
        {
          message: /prop "type" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Button: type="button"
    {
      code: '<Button type="button">Click</Button>',
      output: '<Button>Click</Button>',
      errors: [
        {
          message: /prop "type" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Button: size="M"
    {
      code: '<Button size="M">Click</Button>',
      output: '<Button>Click</Button>',
      errors: [
        {
          message: /prop "size" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Button: wide={false}
    {
      code: '<Button wide={false}>Click</Button>',
      output: '<Button>Click</Button>',
      errors: [
        {
          message: /prop "wide" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Button: variant="secondary"
    {
      code: '<Button variant="secondary">Click</Button>',
      output: '<Button>Click</Button>',
      errors: [
        {
          message: /prop "variant" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Button: loading={false}
    {
      code: '<Button loading={false}>Click</Button>',
      output: '<Button>Click</Button>',
      errors: [
        {
          message: /prop "loading" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // Button: 複数のデフォルト値
    {
      code: '<Button type="button" size="M" variant="secondary">Click</Button>',
      output: '<Button size="M">Click</Button>',
      errors: [
        {
          message: /prop "type" はデフォルト値と同じため不要です/,
        },
        {
          message: /prop "size" はデフォルト値と同じため不要です/,
        },
        {
          message: /prop "variant" はデフォルト値と同じため不要です/,
        },
      ],
    },
    // 改行ありのフォーマット（複数のデフォルト値）
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
          message: /prop "inline" はデフォルト値と同じため不要です/,
        },
        {
          message: /prop "gap" はデフォルト値と同じため不要です/,
        },
      ],
    },
  ],
})
