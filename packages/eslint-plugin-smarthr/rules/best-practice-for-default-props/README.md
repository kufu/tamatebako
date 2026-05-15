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

**Stack**
- `inline={false}`
- `gap={1}`

**Cluster**
- `inline={false}`
- `gap={0.5}`

**Reel**
- `gap={0.5}`
- `padding={0}`

**Sidebar**
- `align="stretch"`
- `contentsMinWidth="50%"`
- `gap={1}`
- `right={false}`

### その他

**Heading**
- `type="sectionTitle"`

**Button**
- `type="button"`
- `size="M"`
- `wide={false}`
- `variant="secondary"`
- `loading={false}`

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

// その他
<Heading type="sectionTitle">Title</Heading>
<Button type="button" size="M" wide={false} variant="secondary" loading={false}>
  Click
</Button>
```

## ✅ Correct

```tsx
// デフォルト値は省略
<Stack>...</Stack>
<Cluster>...</Cluster>
<Reel>...</Reel>
<Sidebar>...</Sidebar>
<Heading>Title</Heading>
<Button>Click</Button>

// デフォルト値と異なる値を指定する場合は必要
<Stack inline gap={2}>...</Stack>
<Cluster gap={1}>...</Cluster>
<Reel gap={1} padding={1}>...</Reel>
<Sidebar align="start" right>...</Sidebar>
<Heading type="screenTitle">Title</Heading>
<Button variant="primary" size="S" wide loading>
  Click
</Button>
```

## 参考

デフォルト値は以下のsmarthr-uiソースコードから取得しています：

### Layout
- [Stack.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Layout/Stack/Stack.tsx)
- [Cluster.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Layout/Cluster/Cluster.tsx)
- [Reel.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Layout/Reel/Reel.tsx)
- [Sidebar.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Layout/Sidebar/Sidebar.tsx)

### その他
- [Heading.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Heading/Heading.tsx)
- [Button.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Button/Button.tsx)
