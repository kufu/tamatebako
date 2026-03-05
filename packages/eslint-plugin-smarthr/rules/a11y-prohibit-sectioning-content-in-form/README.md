# smarthr/a11y-prohibit-sectioning-content-in-form

form, fieldset, smarthr-ui/Fieldset 以下でSectioningContent(section, aside, article, nav)が利用されている場合、smarthr-ui/Fieldset, fieldset要素に置き換えることを促すルールです。

## なぜSectioninContent要素ではなく、fieldset要素を使うことを推奨するのか

このルールは適用することでマークアップの方針が定められ、利用者の利便性を上げることを目的にしています。

前提としてスクリーンリーダーなど、一部ブラウザには要素の種類毎にジャンプする機能が存在します。
(例: h1~h6の見出し要素のみに連続して移動できる等)

またSectioninContent要素は基本的に子孫にHeadingを保つ必要があります。

フォーム内で`SectioningContent>heading` と `fieldset>legend` 混在した場合、スクリーンリーダーのジャンプ機能を利用する際**headingだけ、legendだけなど特定の要素毎にジャンプしてしまう**ため**フォーム内の要素を見落としてしまう可能性**が高くなります。<br />
仮に見落とさなかったとしても都度ジャンプ先を切り替える必要性が生じ、ユーザーの利便性を著しく損ないます。<br />
そのため基本的に同一フォーム内でheadingとlegend・label要素を混在させることは非推奨です。<br />

**フォーム内でlegend・label要素を利用しないことはa11yの観点からは不可能なため、SectioningContent+Heading要素は利用しないことを推奨しています**。

### 内部に入力要素を持たない場合もfieldset要素でマークアップすることは問題ないのか？

前提として**fieldset要素は内部に入力要素を含まない場合でもvalidであり、利用可能**です。
formとしてマークアップされている要素の子要素として存在する場合、見出し・説明文などもフォームを構成する一要素である、という思想のルールになっています。

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
```

```jsx
// fieldset要素以下にAsideが存在するためNG
const AnyComponent = <Fieldset>
  <Aside>
    <Heading>ANY TITLE.</Heading>
  </Aside>
</Fieldset>
```

```jsx
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
const AnyComponent = (
  <form>
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
)
```
