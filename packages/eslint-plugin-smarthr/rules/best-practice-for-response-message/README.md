# smarthr/best-practice-for-response-message

ResponseMessageコンポーネントの適切な使用を促すルールです。現時点では、見出しやラベルで使用することを禁止します。

## ルールの詳細

ResponseMessageは、APIの実行結果やフィードバックメッセージを表示するためのコンポーネントです。見出しやフォームのラベルでの使用には適していません。

### 禁止される使用箇所

- **Heading系コンポーネントのchildren**: `<Heading>`、`<PageHeading>`、`<h1>`～`<h6>`
- **FormControlのlabel属性**: `<FormControl label={...} />`
- **Fieldsetのlegend属性**: `<Fieldset legend={...} />`
- **label要素のchildren**: `<label>`
- **legend要素のchildren**: `<legend>`

## なぜResponseMessageを禁止するのか

### 本来の目的との不一致

ResponseMessageはAPIの実行結果やユーザーアクションへのフィードバックを表示するためのコンポーネントです。見出しやラベルは通常APIレスポンスとは関係なく使用されるため、用途が異なります。

見出しやラベルにアイコンを表示したい場合は、以下の方法を検討してください：

- 見出し: `<Heading icon={...}>`のicon属性、または`smarthr-ui/Text`
- FormControlのラベル: `<FormControl label={{ text: '...', icon: ... }}>`のlabel.icon属性
- Fieldsetの凡例: `<Fieldset legend={{ text: '...', icon: ... }}>`のlegend.icon属性

### セマンティクスの問題

ResponseMessageには成功・エラー・警告などの意味が含まれており、構造的な見出しやラベルに不適切な意味を付加してしまいます。

## 自動修正（auto-fixer）

このルールには自動修正機能が実装されています。`--fix`オプションを使用することで、不適切なResponseMessageの使用を適切な形式に自動変換できます。

### 自動修正の動作

- **Heading/PageHeading**: `icon`属性を追加し、ResponseMessageの内容を展開
- **FormControl/Fieldset**: `label`/`legend`属性をオブジェクト形式に変換し、`icon`プロパティを追加
- **h1-h6/label/legend要素**: ResponseMessageを`<Text icon={...}>`に置き換え
- **icon.gap**: 未指定（Textコンポーネントのデフォルト値0.25が使用されます）

### 自動修正されないケース

既に`icon`属性が設定されている場合は、意図的な設定と判断し自動修正されません。手動での対応が必要です。

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-response-message': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
// Heading系のchildren内
<Heading>
  <ResponseMessage type="success">Xxxx</ResponseMessage>
</Heading>

<h1>
  <ResponseMessage type="info">Hoge</ResponseMessage>
</h1>

<PageHeading>
  <ResponseMessage type="warning">Fuga</ResponseMessage>
</PageHeading>

// FormControlのlabel属性
<FormControl
  label={<ResponseMessage type="success">Foo</ResponseMessage>}
>
  <Input />
</FormControl>

// Fieldsetのlegend属性
<Fieldset
  legend={<ResponseMessage type="info">Bar</ResponseMessage>}
>
  <RadioButton name="option">オプション1</RadioButton>
</Fieldset>

// label要素のchildren内
<label>
  <ResponseMessage type="success">Foo</ResponseMessage>
</label>

// legend要素のchildren内
<legend>
  <ResponseMessage type="warning">Bar</ResponseMessage>
</legend>
```

## ✅ Correct

```jsx
// Heading系コンポーネントの場合はicon属性を使用
<Heading icon={<FaCircleCheckIcon />}>Xxxx</Heading>

<PageHeading icon={<FaCircleInfoIcon />}>Hoge</PageHeading>

// 生のheading要素の場合はTextを使用
<h1>
  <Text icon={<FaCircleInfoIcon />}>Fuga</Text>
</h1>

// FormControlの場合はlabel.icon属性を使用
<FormControl label={{ text: 'Foo', icon: <FaCircleCheckIcon /> }}>
  <Input />
</FormControl>

// Fieldsetの場合はlegend.icon属性を使用
<Fieldset legend={{ text: 'Bar', icon: <WarningIcon /> }}>
  <RadioButton name="option">オプション1</RadioButton>
</Fieldset>

// 生のlabel/legend要素の場合はTextを使用
<label>
  <Text icon={<FaCircleInfoIcon />}>Foo</Text>
</label>

<legend>
  <Text icon={<FaCircleExclamationIcon />}>Bar</Text>
</legend>

// ResponseMessageは結果表示に使用
<div>
  <ResponseMessage type="success">
    データを保存しました
  </ResponseMessage>
</div>

<section>
  <Heading>Xxxx</Heading>
  <ResponseMessage type="error">
    エラーが発生しました
  </ResponseMessage>
</section>
```
