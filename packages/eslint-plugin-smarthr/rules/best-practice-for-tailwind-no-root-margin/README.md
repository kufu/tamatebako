# best-practice-for-tailwind-no-root-margin

tailwindcss を使用したコンポーネントのルート要素に外側の余白（margin）を設定することを禁止します。

## ルールの目的

コンポーネントは、それ自体が外側に余白を持つべきではありません。外側の余白の制御は、コンポーネントを使用する側の責任とすべきです。

これにより、以下のメリットがあります。

- コンポーネントの再利用性が向上します
- レイアウトの一貫性が保たれます
- コンポーネント間の余白の調整が容易になります

## 対象となるクラス名

以下のパターンのクラス名が検出対象となります。

- `shr-m-`
- `shr-mt-`
- `shr-mr-`
- `shr-mb-`
- `shr-ml-`

クラス名のプレフィックス(`shr-`) の通り、SmartHR UI と合わせて使用されることを前提としています。

## NG例

```jsx
const Button = () => {
  return <button className="shr-m-4">Click me</button>
}

const Card = () => {
  return (
    <div className="shr-mt-4">
      <p>Content</p>
    </div>
  )
}
```

## OK例

```jsx
const Button = ({ className }) => {
  return <button className={className}>Click me</button>
}

const Card = () => {
  return (
    <div>
      <p>Content</p>
    </div>
  )
}

// 使用する側で余白を制御
const Page = () => {
  return (
    <div>
      <Button className="shr-m-4" />
      <div className="shr-mt-4">
        <Card />
      </div>
    </div>
  )
}
```

## オプション

このルールにはオプションはありません。
