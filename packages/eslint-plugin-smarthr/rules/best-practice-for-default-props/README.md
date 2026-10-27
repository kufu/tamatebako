# smarthr/best-practice-for-default-props

smarthr-uiコンポーネントで、デフォルト値と同じ値が指定されているpropsを削除するよう促します。

## なぜこのルールが必要なのか

コンポーネントのpropsにデフォルト値と同じ値を明示的に指定することは冗長であり、以下の問題があります：

1. **コードの可読性低下**: 不要なpropsが増えると、本当に重要な設定が埋もれてしまう
2. **メンテナンス性の低下**: デフォルト値が変更された場合、明示的に指定されている箇所を全て確認・修正する必要がある
3. **コードの冗長性**: 省略できる記述を書くことで、コード量が増える

このルールにより、デフォルト値と同じpropsを自動的に検出・削除できます。

## 対象コンポーネント

### Layout

**Cluster**
- `inline={false}`
- `gap={0.5}`

**Container**
- `size="DEFAULT"`

**Reel**
- `gap={0.5}`
- `padding={0}`

**Sidebar**
- `align="stretch"`
- `contentsMinWidth="50%"`
- `gap={1}`
- `right={false}`

**Stack**
- `inline={false}`
- `gap={1}`

### その他

**AccordionPanel**
- `iconPosition="left"`
- `expandableMultiply={true}`

**AnchorButton**
- `size="M"`
- `wide={false}`
- `variant="secondary"`

**Button**
- `type="button"`
- `size="M"`
- `wide={false}`
- `variant="secondary"`
- `loading={false}`

**DropZone**
- `multiple={true}`（内部実装の`ActualDropZone`側のデフォルト値だが、`DropZone`からそのまま伝播するため対象に含める）

**Heading**
- `type="sectionTitle"`

**InformationPanel**
- `type="info"`

**LineClamp**
- `maxLines={3}`

**Loader**
- `size="M"`
- `type="primary"`

**ModelessDialog**
- `resizable={false}`

**PageHeading**
- `autoPageTitle={true}`
- `size="XL"`

**ResponseMessage**
- `status="info"`

**Scroller**
- `direction="vertical"`
- `styleType="auto"`

**SegmentedControl**
- `size="M"`

**SideMenu**
- `elementAs="ul"`

**SideNav**
- `size="M"`

**StatusLabel**
- `type="grey"`
- `bold={false}`

**TabItem**
- `selected={false}`

**Table**
- `reel={true}`

**Textarea**
- `autoResize={false}`
- `rows={2}`

**Tooltip**
- `type="description"`
- `ariaDescribedbyTarget="wrapper"`

## options

### defaultProps

独自のコンポーネントやsmarthr-uiの他のコンポーネントのデフォルト値を追加・上書きできます。

```js
{
  "smarthr/best-practice-for-default-props": ["error", {
    "defaultProps": {
      "Button": {
        "size": "default",
        "variant": "primary"
      },
      "Stack": {
        "gap": 2  // 既存のデフォルト値(1)を上書き
      }
    }
  }]
}
```

## rules

このルールは `--fix` オプションでの自動修正に対応しています。

```js
{
  rules: {
    'smarthr/best-practice-for-default-props': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```tsx
// Layout
<Stack inline={false} gap={1}>...</Stack>
<Cluster inline={false} gap={0.5}>...</Cluster>
<Reel gap={0.5} padding={0}>...</Reel>
<Sidebar align="stretch" contentsMinWidth="50%" gap={1} right={false}>...</Sidebar>
<Container size="DEFAULT">...</Container>

// その他
<Heading type="sectionTitle">Title</Heading>
<Button type="button" size="M" wide={false} variant="secondary" loading={false}>
  Click
</Button>
<Loader size="M" type="primary" />
<Table reel={true}>...</Table>
<Tooltip type="description" ariaDescribedbyTarget="wrapper" message="hint">...</Tooltip>
```

## ✅ Correct

```tsx
// デフォルト値は省略
<Stack>...</Stack>
<Cluster>...</Cluster>
<Reel>...</Reel>
<Sidebar>...</Sidebar>
<Container>...</Container>
<Heading>Title</Heading>
<Button>Click</Button>
<Loader />
<Table>...</Table>
<Tooltip message="hint">...</Tooltip>

// デフォルト値と異なる値を指定する場合は必要
<Stack inline gap={2}>...</Stack>
<Cluster gap={1}>...</Cluster>
<Reel gap={1} padding={1}>...</Reel>
<Sidebar align="start" right>...</Sidebar>
<Container size="S">...</Container>
<Heading type="screenTitle">Title</Heading>
<Button variant="primary" size="S" wide loading>
  Click
</Button>
```

## 参考

デフォルト値は以下のsmarthr-uiソースコードから取得しています：

### Layout
- [Cluster.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Layout/Cluster/Cluster.tsx)
- [Container.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Layout/client/Container/Container.tsx)
- [Reel.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Layout/Reel/Reel.tsx)
- [Sidebar.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Layout/Sidebar/Sidebar.tsx)
- [Stack.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Layout/Stack/Stack.tsx)

### その他
- [AccordionPanel.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/AccordionPanel/client/AccordionPanel.tsx)
- [AnchorButton.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Button/AnchorButton.tsx)
- [Button.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Button/Button.tsx)
- [DropZone.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/DropZone/DropZone.tsx) / [ActualDropZone.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/DropZone/client/ActualDropZone.tsx)
- [Heading.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Heading/client/Heading.tsx)
- [InformationPanel.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/InformationPanel/client/InformationPanel.tsx)
- [LineClamp.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/LineClamp/LineClamp.tsx)
- [Loader.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Loader/Loader.tsx)
- [ModelessDialog.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Dialog/ModelessDialog/ModelessDialog.tsx)
- [PageHeading.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Heading/client/PageHeading/PageHeading.tsx)
- [ResponseMessage.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/ResponseMessage/ResponseMessage.tsx)
- [Scroller.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Scroller/client/Scroller.tsx)
- [SegmentedControl.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/SegmentedControl/client/SegmentedControl.tsx)
- [SideMenu.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/SideMenu/SideMenu.tsx)
- [SideNav.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/SideNav/SideNav.tsx)
- [StatusLabel.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/StatusLabel/StatusLabel.tsx)
- [TabItem.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/TabBar/client/TabItem.tsx)
- [Table.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Table/Table.tsx)
- [Textarea.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Textarea/client/Textarea.tsx)
- [Tooltip.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Tooltip/client/Tooltip.tsx)
