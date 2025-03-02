# best-practice-for-tailwind-no-root-margin

コンポーネントのルート要素に余白（margin/padding）を設定することを禁止します。

## ルールの目的

コンポーネントは、それ自体で余白を持つべきではありません。余白の制御は、コンポーネントを使用する側の責任とすべきです。
これにより、以下のメリットがあります：

- コンポーネントの再利用性が向上します
- レイアウトの一貫性が保たれます
- コンポーネント間の余白の調整が容易になります

## 対象となるクラス名

以下のパターンのクラス名が検出対象となります：

### Margin系

- `shr-m-`: 全方向のマージン
- `shr-mt-`: 上方向のマージン
- `shr-mr-`: 右方向のマージン
- `shr-mb-`: 下方向のマージン
- `shr-ml-`: 左方向のマージン

### Padding系

- `shr-p-`: 全方向のパディング
- `shr-pt-`: 上方向のパディング
- `shr-pr-`: 右方向のパディング
- `shr-pb-`: 下方向のパディング
- `shr-pl-`: 左方向のパディング

## NG例

```jsx
const Button = () => {
  return <button className="shr-mt-4">Click me</button>
}

const Card = () => {
  return (
    <div className="shr-p-4">
      <p>Content</p>
    </div>
  )
}
```

## OK例

```jsx
const Button = () => {
  return <button className="shr-bg-blue-500">Click me</button>
}

// 使用する側で余白を制御
const Page = () => {
  return (
    <div>
      <Button className="shr-mt-4" />
      <div className="shr-p-4">
        <Button />
      </div>
    </div>
  )
}
```

## オプション

このルールにはオプションはありません。
