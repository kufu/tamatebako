# smarthr/best-practice-for-text-component

Textコンポーネントの適切な使用を促進するルールです。以下の3つのチェックを行います：

1. **不要なTextコンポーネントの検出**: Textの機能を使用していない場合、ネイティブHTML要素の使用を推奨
2. **className属性の最適化**: shr-プレフィックスのクラスがある場合、Textコンポーネントの属性への置き換えを推奨
3. **矛盾する指定の防止**: Text属性とshr-プレフィックスのクラスを同時に使用している場合に警告

## なぜこのルールが必要なのか

### 1. 不要な抽象化の排除

Textコンポーネントは、weight、size、color等のスタイリング属性を提供するために存在します。これらの機能を活用していない場合、不要な抽象化レイヤーを追加しているだけになります。

ネイティブHTML要素を直接使用することで、以下のメリットがあります：

- **コードがシンプルになる**: 余計なコンポーネントラッパーがなくなり、意図が明確になります
- **パフォーマンスの向上**: 不要なコンポーネントレンダリングが減少します
- **HTML標準に準拠**: ネイティブ要素を使うことで、HTML標準の挙動がそのまま利用できます

### 2. 型安全性と可読性の向上

shr-プレフィックスのTailwindクラス（smarthr-ui専用クラス）をTextコンポーネントの属性に置き換えることで：

- **型安全性の向上**: 文字列のクラス名ではなく、TypeScriptで型チェックされる属性を使用できます
- **可読性の向上**: `className="shr-text-sm shr-font-bold"` よりも `size="S" weight="bold"` の方が意図が明確です
- **保守性の向上**: smarthr-uiのAPIを直接使用することで、将来のリファクタリングが容易になります

### 3. 矛盾する指定の防止

Textコンポーネントの属性とshr-プレフィックスのクラスを同時に使用すると、意図しない挙動になる可能性があります：

- **予期しないスタイル**: `<Text size="M" className="shr-text-sm">` のように、異なるサイズ指定が競合します
- **可読性の低下**: どちらが優先されるのか判断しにくく、コードの意図が不明確になります
- **メンテナンスの困難**: 将来的にスタイルを変更する際、両方を確認・修正する必要が生じます

このルールにより、一貫した方法でTextコンポーネントを使用できます。

## チェックする内容

### パターン1: 不要なTextコンポーネントの検出

以下のパターンで、ネイティブHTML要素への置き換えを推奨します：

```jsx
// NG: 属性なし
<Text>content</Text>
// → 推奨: <span>content</span> または要素を削除

// NG: as属性のみ
<Text as="p">content</Text>
// → 推奨: <p>content</p>

// NG: 変換不可能なclassNameのみ
<Text className="custom">content</Text>
// → 推奨: <span className="custom">content</span>

// NG: as + 変換不可能なclassName
<Text as="p" className="custom">content</Text>
// → 推奨: <p className="custom">content</p>
```

### パターン2: className属性の最適化

shr-プレフィックスのクラスをTextの属性に置き換えることを推奨します：

```jsx
// NG: shr-クラスのみ
<Text className="shr-text-sm">text</Text>
// → 推奨: <Text size="S">text</Text>

// NG: 複数のshr-クラス
<Text className="shr-text-sm shr-font-bold">text</Text>
// → 推奨: <Text size="S" weight="bold">text</Text>

// NG: shr-クラス + as
<Text as="p" className="shr-text-sm">text</Text>
// → 推奨: <Text as="p" size="S">text</Text>

// NG: shr-クラス + 変換不可能なクラス
<Text className="shr-text-sm custom-class">text</Text>
// → 推奨: <Text size="S" className="custom-class">text</Text>
```

### パターン3: 属性とclassNameの矛盾

Textの属性とshr-プレフィックスのクラスを同時に使用している場合、どちらか一方のみを使用することを推奨します：

```jsx
// NG: size属性とshr-text-*クラスの併用
<Text size="M" className="shr-text-sm">text</Text>
// → 推奨: <Text size="M">text</Text> または <Text className="shr-text-sm">text</Text>

// NG: weight属性とshr-font-*クラスの併用
<Text weight="bold" className="shr-font-normal">text</Text>
// → 推奨: <Text weight="bold">text</Text> または <Text className="shr-font-normal">text</Text>

// NG: 複数の矛盾
<Text size="L" className="shr-text-sm shr-font-bold">text</Text>
// → 推奨: <Text size="L">text</Text> または <Text size="S" weight="bold">text</Text>
```

### 許容されるパターン

以下の場合はエラーになりません：

```jsx
// OK: Textのスタイリング属性を使用
<Text weight="bold">content</Text>
<Text size="M">text</Text>
<Text color="TEXT_GREY">text</Text>
<Text leading="TIGHT">text</Text>
<Text italic>text</Text>
<Text whiteSpace="nowrap">text</Text>
<Text maxLines={2}>text</Text>
<Text styleType="blockTitle">text</Text>
<Text icon={<Icon />}>text</Text>

// OK: as + スタイリング属性
<Text as="p" weight="bold">content</Text>

// OK: スタイリング属性 + className（変換不可能なクラスのみ）
<Text size="M" className="custom">text</Text>
<Text weight="bold" className="custom-class">text</Text>

// OK: className/asが変数や式（静的解析不可能）
<Text className={customClass}>text</Text>
<Text className={`custom-${type}`}>text</Text>
<Text as={component}>text</Text>
<Text size="M" className={customClass}>text</Text>
```

## 対応するクラス名とプロパティのマッピング

以下のshr-プレフィックスのクラスが検出対象です：

### size属性

- `shr-text-2xs` → `size="XXS"`
- `shr-text-xs` → `size="XS"`
- `shr-text-sm` → `size="S"`
- `shr-text-base` → `size="M"`
- `shr-text-lg` → `size="L"`
- `shr-text-xl` → `size="XL"`
- `shr-text-2xl` → `size="XXL"`

### weight属性

- `shr-font-normal` → `weight="normal"`
- `shr-font-bold` → `weight="bold"`

### leading属性

- `shr-leading-none` → `leading="NONE"`
- `shr-leading-tight` → `leading="TIGHT"`
- `shr-leading-normal` → `leading="NORMAL"`
- `shr-leading-loose` → `leading="LOOSE"`

### color属性

- `shr-text-black` → `color="TEXT_BLACK"`
- `shr-text-white` → `color="TEXT_WHITE"`
- `shr-text-grey` → `color="TEXT_GREY"`
- `shr-text-disabled` → `color="TEXT_DISABLED"`
- `shr-text-link` → `color="TEXT_LINK"`
- `shr-text-color-inherit` → `color="inherit"`

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-text-component': 'error', // 'warn', 'off'
  },
}
```

## 使用例

### ❌ Incorrect

```jsx
// 不要なTextコンポーネント
<Text>テキスト</Text>
<Text as="p">これはテキストです</Text>
<Text className="custom">テキスト</Text>

// shr-クラスを属性に変換すべき
<Text className="shr-text-sm shr-font-bold">強調テキスト</Text>
<Text as="p" className="shr-text-sm">段落</Text>
<Text className="shr-text-sm custom-class">テキスト</Text>

// 属性とclassNameの矛盾
<Text size="M" className="shr-text-sm">テキスト</Text>
<Text weight="bold" className="shr-font-normal">テキスト</Text>
```

### ✅ Correct

```jsx
// ネイティブHTML要素を使用
<span>テキスト</span>
<p>これはテキストです</p>
<span className="custom">テキスト</span>

// Textの属性を使用
<Text size="S" weight="bold">強調テキスト</Text>
<Text as="p" size="S">段落</Text>
<Text size="S" className="custom-class">テキスト</Text>

// 矛盾を解消
<Text size="M">テキスト</Text>
<Text weight="bold">テキスト</Text>
<Text size="M" className="custom-class">テキスト</Text>
```
