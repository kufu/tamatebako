# smarthr/best-practice-for-text-element

Textコンポーネントに属性がない、またはas属性のみが設定されている場合、ネイティブHTML要素の使用を推奨するルールです。

## なぜネイティブHTML要素を使うべきなのか

Textコンポーネントは、weight、size、color等のスタイリング属性を提供するために存在します。属性がない、またはas属性のみを設定している場合、Textコンポーネントの機能を活用しておらず、不要な抽象化レイヤーを追加しているだけになります。

ネイティブHTML要素を直接使用することで、以下のメリットがあります：

- **コードがシンプルになる**: 余計なコンポーネントラッパーがなくなり、意図が明確になります
- **パフォーマンスの向上**: 不要なコンポーネントレンダリングが減少します
- **HTML標準に準拠**: ネイティブ要素を使うことで、HTML標準の挙動がそのまま利用できます

## チェックする内容

以下のパターンで、Textコンポーネントの使用を検出します：

```jsx
// NG: as属性のみ
<Text as="p">content</Text>
<Text as="span">text</Text>
<Text as="li">item</Text>

// NG: 属性なし（spanに置き換え）
<Text>content</Text>
```

以下の場合は許容されます：

- weight、size、color等の属性がある場合（Textコンポーネントの機能を活用している）

```jsx
// OK: Textの機能を活用している
<Text as="p" weight="bold">content</Text>
<Text as="span" size="M">text</Text>
<Text as="li" color="TEXT_BLACK">item</Text>
<Text weight="bold">content</Text>
<Text className="custom">content</Text>
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
// as属性のみ
<Text as="p">これはテキストです</Text>
<Text as="span">ラベル</Text>
<Text as="li">リストアイテム</Text>
<Text as="div">コンテンツ</Text>

// 属性なし
<Text>テキスト</Text>
```

## ✅ Correct

```jsx
// ネイティブHTML要素を使用
<p>これはテキストです</p>
<span>ラベル</span>
<li>リストアイテム</li>
<div>コンテンツ</div>

// 属性なしの場合はspanを使用
<span>テキスト</span>

// Textコンポーネントの機能を活用
<Text as="p" weight="bold">これはテキストです</Text>
<Text as="span" size="S">ラベル</Text>
<Text as="li" color="TEXT_BLACK">リストアイテム</Text>
<Text weight="bold">スタイル付きテキスト</Text>
<Text className="custom">カスタムクラス</Text>
```
