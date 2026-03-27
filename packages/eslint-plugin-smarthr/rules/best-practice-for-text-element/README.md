# smarthr/best-practice-for-text-element

Textコンポーネントにas属性のみが設定されている場合、ネイティブHTML要素の使用を推奨するルールです。

## なぜネイティブHTML要素を使うべきなのか

Textコンポーネントは、weight、size、color等のスタイリング属性を提供するために存在します。as属性のみを設定している場合、Textコンポーネントの機能を活用しておらず、不要な抽象化レイヤーを追加しているだけになります。

ネイティブHTML要素を直接使用することで、以下のメリットがあります：

- **コードがシンプルになる**: 余計なコンポーネントラッパーがなくなり、意図が明確になります
- **パフォーマンスの向上**: 不要なコンポーネントレンダリングが減少します
- **HTML標準に準拠**: ネイティブ要素を使うことで、HTML標準の挙動がそのまま利用できます

## チェックする内容

以下のパターンで、as属性のみを持つTextコンポーネントの使用を検出します：

```jsx
// NG: as属性のみ
<Text as="p">content</Text>
<Text as="span">text</Text>
<Text as="li">item</Text>
```

以下の場合は許容されます：

- as以外の属性がある場合（Textコンポーネントの機能を活用している）
- asがない場合（Textのデフォルト挙動を使用）

```jsx
// OK: as以外の属性がある
<Text as="p" weight="bold">content</Text>
<Text as="span" size="M">text</Text>
<Text as="li" color="TEXT_BLACK">item</Text>

// OK: asがない
<Text>content</Text>
<Text weight="bold">content</Text>
```

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-text-element': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
<Text as="p">これはテキストです</Text>
<Text as="span">ラベル</Text>
<Text as="li">リストアイテム</Text>
<Text as="div">コンテンツ</Text>
```

## ✅ Correct

```jsx
// ネイティブHTML要素を使用
<p>これはテキストです</p>
<span>ラベル</span>
<li>リストアイテム</li>
<div>コンテンツ</div>

// Textコンポーネントの機能を活用
<Text as="p" weight="bold">これはテキストです</Text>
<Text as="span" size="S">ラベル</Text>
<Text as="li" color="TEXT_BLACK">リストアイテム</Text>

// asなしでTextを使用
<Text>デフォルトのテキスト</Text>
```
