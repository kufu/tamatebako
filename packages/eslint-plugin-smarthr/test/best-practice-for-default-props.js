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
    // 新規追加コンポーネント: デフォルト値と異なる値
    {
      code: '<AccordionPanel iconPosition="right">content</AccordionPanel>',
    },
    {
      code: '<AnchorButton size="S" href="/">Click</AnchorButton>',
    },
    {
      code: '<Container size="S">content</Container>',
    },
    {
      code: '<DropZone multiple={false}>content</DropZone>',
    },
    {
      code: '<InformationPanel type="error">content</InformationPanel>',
    },
    {
      code: '<LineClamp maxLines={2}>content</LineClamp>',
    },
    {
      code: '<Loader size="S" />',
    },
    {
      code: '<ModelessDialog resizable>content</ModelessDialog>',
    },
    {
      code: '<PageHeading autoPageTitle={false}>Title</PageHeading>',
    },
    {
      code: '<ResponseMessage status="error">content</ResponseMessage>',
    },
    {
      code: '<Scroller direction="horizontal">content</Scroller>',
    },
    {
      code: '<SegmentedControl size="S">content</SegmentedControl>',
    },
    {
      code: '<SideMenu elementAs="div">content</SideMenu>',
    },
    {
      code: '<SideNav size="S">content</SideNav>',
    },
    {
      code: '<StatusLabel type="red">content</StatusLabel>',
    },
    {
      code: '<TabItem selected>content</TabItem>',
    },
    {
      code: '<Table reel={false}>content</Table>',
    },
    {
      code: '<Textarea rows={5} />',
    },
    {
      code: '<Tooltip type="balloon" message="hint">content</Tooltip>',
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
    // AccordionPanel: iconPosition="left"
    {
      code: '<AccordionPanel iconPosition="left">content</AccordionPanel>',
      output: '<AccordionPanel>content</AccordionPanel>',
      errors: [{ message: /prop "iconPosition" はデフォルト値と同じため不要です/ }],
    },
    // AccordionPanel: expandableMultiply={true}
    {
      code: '<AccordionPanel expandableMultiply={true}>content</AccordionPanel>',
      output: '<AccordionPanel>content</AccordionPanel>',
      errors: [{ message: /prop "expandableMultiply" はデフォルト値と同じため不要です/ }],
    },
    // AnchorButton: size="M"
    {
      code: '<AnchorButton size="M" href="/">Click</AnchorButton>',
      output: '<AnchorButton href="/">Click</AnchorButton>',
      errors: [{ message: /prop "size" はデフォルト値と同じため不要です/ }],
    },
    // AnchorButton: wide={false}
    {
      code: '<AnchorButton wide={false} href="/">Click</AnchorButton>',
      output: '<AnchorButton href="/">Click</AnchorButton>',
      errors: [{ message: /prop "wide" はデフォルト値と同じため不要です/ }],
    },
    // AnchorButton: variant="secondary"
    {
      code: '<AnchorButton variant="secondary" href="/">Click</AnchorButton>',
      output: '<AnchorButton href="/">Click</AnchorButton>',
      errors: [{ message: /prop "variant" はデフォルト値と同じため不要です/ }],
    },
    // Container: size="DEFAULT"
    {
      code: '<Container size="DEFAULT">content</Container>',
      output: '<Container>content</Container>',
      errors: [{ message: /prop "size" はデフォルト値と同じため不要です/ }],
    },
    // DropZone: multiple={true}
    {
      code: '<DropZone multiple={true}>content</DropZone>',
      output: '<DropZone>content</DropZone>',
      errors: [{ message: /prop "multiple" はデフォルト値と同じため不要です/ }],
    },
    // InformationPanel: type="info"
    {
      code: '<InformationPanel type="info">content</InformationPanel>',
      output: '<InformationPanel>content</InformationPanel>',
      errors: [{ message: /prop "type" はデフォルト値と同じため不要です/ }],
    },
    // LineClamp: maxLines={3}
    {
      code: '<LineClamp maxLines={3}>content</LineClamp>',
      output: '<LineClamp>content</LineClamp>',
      errors: [{ message: /prop "maxLines" はデフォルト値と同じため不要です/ }],
    },
    // Loader: size="M"
    {
      code: '<Loader size="M" />',
      output: '<Loader />',
      errors: [{ message: /prop "size" はデフォルト値と同じため不要です/ }],
    },
    // Loader: type="primary"
    {
      code: '<Loader type="primary" />',
      output: '<Loader />',
      errors: [{ message: /prop "type" はデフォルト値と同じため不要です/ }],
    },
    // ModelessDialog: resizable={false}
    {
      code: '<ModelessDialog resizable={false}>content</ModelessDialog>',
      output: '<ModelessDialog>content</ModelessDialog>',
      errors: [{ message: /prop "resizable" はデフォルト値と同じため不要です/ }],
    },
    // PageHeading: autoPageTitle={true}
    {
      code: '<PageHeading autoPageTitle={true}>Title</PageHeading>',
      output: '<PageHeading>Title</PageHeading>',
      errors: [{ message: /prop "autoPageTitle" はデフォルト値と同じため不要です/ }],
    },
    // PageHeading: size="XL"
    {
      code: '<PageHeading size="XL">Title</PageHeading>',
      output: '<PageHeading>Title</PageHeading>',
      errors: [{ message: /prop "size" はデフォルト値と同じため不要です/ }],
    },
    // ResponseMessage: status="info"
    {
      code: '<ResponseMessage status="info">content</ResponseMessage>',
      output: '<ResponseMessage>content</ResponseMessage>',
      errors: [{ message: /prop "status" はデフォルト値と同じため不要です/ }],
    },
    // Scroller: direction="vertical"
    {
      code: '<Scroller direction="vertical">content</Scroller>',
      output: '<Scroller>content</Scroller>',
      errors: [{ message: /prop "direction" はデフォルト値と同じため不要です/ }],
    },
    // Scroller: styleType="auto"
    {
      code: '<Scroller styleType="auto">content</Scroller>',
      output: '<Scroller>content</Scroller>',
      errors: [{ message: /prop "styleType" はデフォルト値と同じため不要です/ }],
    },
    // SegmentedControl: size="M"
    {
      code: '<SegmentedControl size="M">content</SegmentedControl>',
      output: '<SegmentedControl>content</SegmentedControl>',
      errors: [{ message: /prop "size" はデフォルト値と同じため不要です/ }],
    },
    // SideMenu: elementAs="ul"
    {
      code: '<SideMenu elementAs="ul">content</SideMenu>',
      output: '<SideMenu>content</SideMenu>',
      errors: [{ message: /prop "elementAs" はデフォルト値と同じため不要です/ }],
    },
    // SideNav: size="M"
    {
      code: '<SideNav size="M">content</SideNav>',
      output: '<SideNav>content</SideNav>',
      errors: [{ message: /prop "size" はデフォルト値と同じため不要です/ }],
    },
    // StatusLabel: type="grey"
    {
      code: '<StatusLabel type="grey">content</StatusLabel>',
      output: '<StatusLabel>content</StatusLabel>',
      errors: [{ message: /prop "type" はデフォルト値と同じため不要です/ }],
    },
    // StatusLabel: bold={false}
    {
      code: '<StatusLabel bold={false}>content</StatusLabel>',
      output: '<StatusLabel>content</StatusLabel>',
      errors: [{ message: /prop "bold" はデフォルト値と同じため不要です/ }],
    },
    // TabItem: selected={false}
    {
      code: '<TabItem selected={false}>content</TabItem>',
      output: '<TabItem>content</TabItem>',
      errors: [{ message: /prop "selected" はデフォルト値と同じため不要です/ }],
    },
    // Table: reel={true}
    {
      code: '<Table reel={true}>content</Table>',
      output: '<Table>content</Table>',
      errors: [{ message: /prop "reel" はデフォルト値と同じため不要です/ }],
    },
    // Textarea: autoResize={false}
    {
      code: '<Textarea autoResize={false} />',
      output: '<Textarea />',
      errors: [{ message: /prop "autoResize" はデフォルト値と同じため不要です/ }],
    },
    // Textarea: rows={2}
    {
      code: '<Textarea rows={2} />',
      output: '<Textarea />',
      errors: [{ message: /prop "rows" はデフォルト値と同じため不要です/ }],
    },
    // Tooltip: type="description"
    {
      code: '<Tooltip type="description" message="hint">content</Tooltip>',
      output: '<Tooltip message="hint">content</Tooltip>',
      errors: [{ message: /prop "type" はデフォルト値と同じため不要です/ }],
    },
    // Tooltip: ariaDescribedbyTarget="wrapper"
    {
      code: '<Tooltip ariaDescribedbyTarget="wrapper" message="hint">content</Tooltip>',
      output: '<Tooltip message="hint">content</Tooltip>',
      errors: [{ message: /prop "ariaDescribedbyTarget" はデフォルト値と同じため不要です/ }],
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
