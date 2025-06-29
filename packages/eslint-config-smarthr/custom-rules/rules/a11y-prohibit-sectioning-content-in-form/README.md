# smarthr/a11y-prohibit-sectioning-content-in-form

- form, fieldset, smarthr-ui/Fieldset 以下でSectioningContent(section, aside, article, nav)が利用されている場合、smarthr-ui/Fieldsetに置き換えることを促すルールです
- このルールは適用することでマークアップの方針が定められ、利用者の利便性を上げることを目的にしています
  - form要素内からHeadingが取り除かれ、Fieldsetに統一され、見出しを表現する要素がlegend, label要素のみになることで、スクリーンリーダーのジャンプ機能などの利便性が大幅に向上します
    - 大抵のスクリーンリーダーのジャンプ機能では、heading・legend要素は区別されており、同一フォーム内にこれら要素が混在していると、切り替える手間が発生します
    - 上記操作をフォーム入力中に行うことになるため、入力要素がスキップされる場合が発生しやすく、基本的にheading と legend・label要素を同一フォーム内で混在させることは非推奨です
  - fieldset要素は内部に入力要素を含まずとも利用可能です
    - formとしてマークアップされている要素の子要素として存在する場合、見出し・説明文などもフォームを構成する一要素である、という思想のルールです
- a11y-form-control-in-form と組み合わせることでより厳密なフォームのマークアップを行えます

## rules

```js
{
  rules: {
    'smarthr/a11y-prohibit-sectioning-content-in-form': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
// form要素以下にSectionが存在するためNG
const AnyComponent = <form>
  <Section>
    <Heading>ANY TITLE.</Heading>
  </Section>
</form>

// fieldset要素以下にAsideが存在するためNG
const AnyComponent = <Fieldset>
  <Aside>
    <Heading>ANY TITLE.</Heading>
  </Aside>
</Fieldset>

// ファイル名、もしくは所属するディレクトリがform, fieldsetなどフォームに関連する名称になっている場合
// 内部でArticleを使っているとNG
const AnyComponent = <>
  <Article>
    <Heading>ANY TITLE.</Heading>
  </Article>
</>
```

## ✅ Correct

```jsx
// form内でSectioningContentを利用していないのでOK
const AnyComponent = <form>
  <Fieldset title="ANY TITLE.">
    Hoge.
    <Fieldset title="ANY TITLE.">
      Fuga.
      <FormControl  title="ANY TITLE.">
        Piyo.
      </FormControl>
    </Fieldset>
  </Fieldset>
</form>
```
