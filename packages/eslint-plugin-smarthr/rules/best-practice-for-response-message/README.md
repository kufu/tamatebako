# smarthr/best-practice-for-response-message

ResponseMessageコンポーネントを見出しやラベルで使用することを禁止するルールです。

## ルールの詳細

ResponseMessageは、APIの実行結果やフィードバックメッセージを動的に表示するためのコンポーネントです。見出しやフォームのラベルのような静的なテキスト表示には適していません。

### 禁止される使用箇所

- **Heading系コンポーネントのchildren**: `<Heading>`、`<PageHeading>`、`<h1>`～`<h6>`
- **FormControlのlabel属性**: `<FormControl label={...} />`
- **Fieldsetのlegend属性**: `<Fieldset legend={...} />`

## なぜResponseMessageを禁止するのか

### 本来の目的との不一致

ResponseMessageはAPIの実行結果やユーザーアクションへのフィードバックを**動的に**表示するためのコンポーネントです。見出しやラベルは静的な構造的要素であり、用途が異なります。

### アイコン配置の誤用

見出しやラベルにアイコンを表示したいという理由でResponseMessageを使用することは、コンポーネントの本来の目的から外れています。アイコンの配置が必要な場合は、`smarthr-ui/Icon`など適切なコンポーネントを使用してください。

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
```

## ✅ Correct

```jsx
// 見出しにはテキストまたはIconを使用
<Heading>保存完了</Heading>

<h1>
  <Icon name="info" />
  ページタイトル
</h1>

<PageHeading>注意事項</PageHeading>

// FormControlのlabelにはテキストを使用
<FormControl label="名前">
  <Input />
</FormControl>

// Fieldsetのlegendにはテキストを使用
<Fieldset legend="選択してください">
  <RadioButton name="option">オプション1</RadioButton>
</Fieldset>

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
