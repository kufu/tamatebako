# best-practice-for-tailwind-no-root-margin

コンポーネントのルート要素にマージン（余白）を設定することを禁止します。

## ルールの目的

コンポーネントは、それ自体で余白を持つべきではありません。余白の制御は、コンポーネントを使用する側の責任とすべきです。
これにより、以下のメリットがあります：

- コンポーネントの再利用性が向上します
- レイアウトの一貫性が保たれます
- コンポーネント間の余白の調整が容易になります

## NG例

```jsx
const Button = () => {
  return <button className="shr-mt-4 shr-mb-2">Click me</button>
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
      <Button className="shr-mb-4" />
    </div>
  )
}
```

## オプション

このルールにはオプションはありません。
