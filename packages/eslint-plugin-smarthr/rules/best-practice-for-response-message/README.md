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
  <ResponseMessage type="success">保存完了</ResponseMessage>
</Heading>

<h1>
  <ResponseMessage type="info">ページタイトル</ResponseMessage>
</h1>

<PageHeading>
  <ResponseMessage type="warning">注意事項</ResponseMessage>
</PageHeading>

// FormControlのlabel属性
<FormControl
  label={<ResponseMessage type="success">名前</ResponseMessage>}
>
  <Input />
</FormControl>

// Fieldsetのlegend属性
<Fieldset
  legend={<ResponseMessage type="info">選択してください</ResponseMessage>}
>
  <RadioButton name="option">オプション1</RadioButton>
</Fieldset>

// label要素のchildren内
<label>
  <ResponseMessage type="success">ラベル</ResponseMessage>
</label>

// legend要素のchildren内
<legend>
  <ResponseMessage type="warning">凡例</ResponseMessage>
</legend>
```

## ✅ Correct

```jsx
// 見出しにはテキストを使用、アイコンが必要な場合はicon属性を使用
<Heading>保存完了</Heading>

<Heading icon={FaCheckIcon}>保存完了</Heading>

<PageHeading>注意事項</PageHeading>

// 生のheading要素の場合はTextを使用
<h1>
  <Text icon={FaInfoIcon}>ページタイトル</Text>
</h1>

// FormControlのlabelにはテキストを使用、アイコンが必要な場合はlabel.icon属性を使用
<FormControl label="名前">
  <Input />
</FormControl>

<FormControl label={{ text: '名前', icon: FaUserIcon }}>
  <Input />
</FormControl>

// Fieldsetのlegendにはテキストを使用、アイコンが必要な場合はlegend.icon属性を使用
<Fieldset legend="選択してください">
  <RadioButton name="option">オプション1</RadioButton>
</Fieldset>

<Fieldset legend={{ text: '選択してください', icon: FaInfoIcon }}>
  <RadioButton name="option">オプション1</RadioButton>
</Fieldset>

// 生のlabel要素、legend要素の場合はTextを使用
<label>
  <Text icon={FaUserIcon}>名前</Text>
</label>

<legend>
  <Text icon={FaInfoIcon}>説明</Text>
</legend>

// ResponseMessageは結果表示に使用
<div>
  <ResponseMessage type="success">
    データを保存しました
  </ResponseMessage>
</div>

<section>
  <Heading>処理結果</Heading>
  <ResponseMessage type="error">
    エラーが発生しました
  </ResponseMessage>
</section>
```
