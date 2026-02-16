# smarthr/a11y-input-in-form-control

入力要素をsmarthr-ui/FormControl、もしくはsmarthr-ui/Fieldsetで囲むことを促すルールです

## なぜFormControl、Fieldsetで囲まなければならないのか

FormControl、Fieldsetはそれぞれlabel要素、fieldset要素とlegend要素を含み、それらは適切に入力要素と関連付けされます。<br />
例えばFormControlでInputをラップした場合、FormControlが出力するlabel要素は適切にInputと紐づくので、label要素をクリックすることで入力要素にfocusされます。<br />
この動作はブラウザがデフォルトで持つ機能であり、当たり前に期待される動作のため必ず設定する必要性があります。<br />

また入力要素は必ずラベルとなるテキストを何らかの形でもつ必要があります。<br />
紐づくラベルを持たない入力要素はスクリーンリーダーなど一部のブラウザに置いて **その入力要素がなんであるか？という情報が欠落した状態** になり、ユーザー操作に影響します。<br />

同様にFieldsetは複数の入力要素やFormControlを一つのグループとして扱うことを表します。<br />
適切に設定することでformの内容をわかりやすく示すことができます。

### SectioningContent ではなく Fieldset の利用を推奨する理由

このルールではform要素以下でSectioninContent(Section,Article,Aside,Nav)を発見した場合、Fieldsetに変更することを促します。<br />
SectioninContentでもmarkupの観点としては問題ありませんが、一部スクリーンリーダーなどに搭載されている **特定の要素に対するジャンプ機能** などを利用する際にデメリットが生じます。<br />

form要素以下で見出しとして利用される事が多いlabel要素、legend要素以外に**Headingが混ざった場合、ジャンプ機能によって意図せずスキップされてしまう可能性**が高まります。

fielset要素はmarkupとしては必須でinputを持つ必要性はないこと、form内に存在する見出しはformの別の入力要素に対する説明である場合がほとんどであることなどからこのルールではform要素以下では全ての見出しをlabel, legendに統一するためこのチェックを行っています。

## rules

```js
{
  rules: {
    'smarthr/a11y-input-in-form-control': [
      'error', // 'warn', 'off',
      // {
      //   additionalInputComponents: ['^HogeSelector$'], // 単一の入力要素として扱いたいコンポーネント名を正規表現で入力する
      //   additionalMultiInputComponents: ['Inputs$'], // 複数の入力要素として扱いたいコンポーネント名を正規表現で入力する
      // }
    ]
  },
}
```

## ❌ Incorrect

```jsx
// FormControlで囲まれていないためNG
<Input />
```

```jsx
// FormControl・FieldsetではなくSectionでマークアップされているためNG
<Section>
  <Heading />
  <Select />
</Section>
```

```jsx
// RadioButton, Checkboxは内部にlabel要素を持つためFormControlで囲むことは不適切
// 見出しを設定したい場合、Fieldsetでグルーピングする
<FormControl title="any heading">
  <RadioButton>{a.label}</RadioButton>
</FormControl>
```

```jsx
// FormControlが複数の入力要素を持ってしまっているのでNG
<FormControl title="any heading">
  <Input />
  <Combobox />
</FormControl>
```

```jsx
// FormControlがネストしてしまっているのでNG
<FormControl>
  <SubFormControl>
    <Checkbox />
  </SubFormControl>
</FormControl>
```

```jsx
// Fieldsetには role="group" がデフォルトで設定されているのでNG
<Fieldset  role="group" />
```

## ✅ Correct

```jsx
<FormControl title="any heading">
  <Input />
</FormControl>
```

```jsx
// smarthr-ui/Checkbox はlabelを含むため、なんの入力要素かが単独で伝えられるので
// FormControl・Fieldsetで囲む必要はない (Fieldsetで囲んでも問題はない)
<Checkbox />
```

```jsx
<Fieldset title="any heading">
  {radios.map((a) => (
    <RadioButton>{a.label}</RadioButton>
  ))}
</Fieldset>
```

```jsx
<Fieldset title="date range">
  <FormControl label={{ text: "start", unrecommendedHide: true }}>
    <WarekiPicker />
  </FormControl>
  ~
  <FormControl label={{ text: "end", unrecommendedHide: true }}>
    <WarekiPicker />
  </FormControl>
</Fieldset>
```

```jsx
// childrenを持たないFieldset、FormControlは入力要素として扱うためOK
<Fieldset title="any heading">
  <HogeFieldset />
  <FugaFormControl />
</Fieldset>
```
