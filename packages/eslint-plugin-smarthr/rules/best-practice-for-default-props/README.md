# smarthr/best-practice-for-default-props

smarthr-uiコンポーネントで、デフォルト値と同じ値が指定されているpropsを削除するよう促します。

## なぜこのルールが必要なのか

コンポーネントのpropsにデフォルト値と同じ値を明示的に指定することは冗長であり、以下の問題があります：

1. **コードの可読性低下**: 不要なpropsが増えると、本当に重要な設定が埋もれてしまう
2. **メンテナンス性の低下**: デフォルト値が変更された場合、明示的に指定されている箇所を全て確認・修正する必要がある
3. **コードの冗長性**: 省略できる記述を書くことで、コード量が増える

このルールにより、デフォルト値と同じpropsを自動的に検出・削除できます。

## 対象コンポーネント

現在、以下のsmarthr-uiレイアウトコンポーネントのデフォルト値がチェック対象です：

### Stack
- `inline={false}` - デフォルトでinline表示ではない
- `gap={1}` - デフォルトのgapは1

### Cluster
- `inline={false}` - デフォルトでinline表示ではない
- `gap={0.5}` - デフォルトのgapは0.5

## ❌ Incorrect

```tsx
// Stack
<Stack inline={false} gap={1}>
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>

// Cluster
<Cluster inline={false} gap={0.5}>
  <span>Tag 1</span>
  <span>Tag 2</span>
</Cluster>
```

## ✅ Correct

```tsx
// デフォルト値は省略
<Stack>
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>

<Cluster>
  <span>Tag 1</span>
  <span>Tag 2</span>
</Cluster>

// デフォルト値と異なる値を指定する場合は必要
<Stack inline gap={2}>
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>

<Cluster gap={1}>
  <span>Tag 1</span>
  <span>Tag 2</span>
</Cluster>
```

## autofix

このルールは `--fix` オプションでの自動修正に対応しています。

```bash
eslint --fix your-file.tsx
```

**注意**: 複数のデフォルト値が指定されている場合、1回の`--fix`で1つのpropが削除されます。すべて削除するには、エラーがなくなるまで複数回実行してください。

```tsx
// 1回目の --fix
<Stack inline={false} gap={1}>...</Stack>
↓
<Stack gap={1}>...</Stack>

// 2回目の --fix
<Stack gap={1}>...</Stack>
↓
<Stack>...</Stack>
```

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

```js
{
  rules: {
    'smarthr/best-practice-for-default-props': 'error',
  },
}
```

## 参考

デフォルト値は以下のsmarthr-uiソースコードから取得しています：

- [Stack.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Layout/Stack/Stack.tsx)
- [Cluster.tsx](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/Layout/Cluster/Cluster.tsx)
