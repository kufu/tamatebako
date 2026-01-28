# smarthr/best-practice-for-interactive-element

インタラクティブな要素・コンポーネントの利用方法のベストプラクティスを定義するルールです。<br />
以下の内容をチェックします

- インタラクティブな要素にrole属性が設定されている場合エラーとします
- インタラクティブではないコンポーネントに対して、デフォルトで用意されているonXxx形式の属性を設定しようとするとエラーにします
  - 例: `CrewDetail` コンポーネントに `onChange` を設定するとエラー、 `onChangeName` ならOK

## インタラクティブな要素・コンポーネントとは何か

ユーザーが操作・やり取りが可能な要素を指します。<br />
このルールに置いてはHTMLとしての要素以外にsmarthr-uiにおけるコンポーネントも含めます。

### 具体的な要素・コンポーネントの一覧

下記要素・コンポーネント名と一致、もしくはsuffixがコンポーネント名として指定されている場合、その要素はインタラクティブな要素として扱われます。<br />
また複数形(末尾にsを設定するなど)の場合も同様に扱われます。

#### HTMLの対象要素

- a
- button
- details
- dialog
- fieldset
- form
- input
- legend
- select(option)
- summary
- textarea

#### smarthr-uiの対象要素

- AccordionPanel
- Anchor
- Checkbox
- Date
- DatetimeLocal
- Dialog
- DropZone
- FormControl
- InputFile
- Link
- MonthPicker
- RadioButton
- RadioButtonPanel
- RemoteDialogTrigger
- SegmentedControl
- SideNav
- Switch
- TabItem
- TimePicker
- WarekiPicker

## チェックする内容について

### なぜrole属性を設定するべきではないのか

role属性はhtmlの要素の意味(role)を変更するための属性です。<br />
すべてのhtmlの要素はデフォルトの属性を持っており、**基本的にrole属性を利用することは推奨されません**。<br />
不用意に利用した場合、ブラウザが適切な解釈を行うことが出来ず、必要な機能が有効にならない、などの問題が発生する可能性があります。<br />
特に`role="presentation"`は **設定した要素は見た目やJSで利用するためのもので意味づけはない** という設定になるため大変強力な設定になります。

以上の理由からこのルールは **特に問題が起きやすい、インタラクティブな要素に対して`role`属性を使っていたら忠告する**ことを目的としたものになっています。

```jsx
// button要素にrole="presentation"で意味付けを消してしまっていて大変危険なのでNG
<button role="presentation">...</button>
```

additionalInteractiveComponentRegexオプションに独自コンポーネントの名称を正規表現で設定することで、インタラクティブな要素として判定することも可能です。

```jsx
// additionalInteractiveComponentRegex: ['^InteractiveComponent%']
// インタラクティブなコンポーネントとして扱われるものに対してrole="presentation"を指定しており危険なのでNG
<InteractiveComponent role="presentation">...</InteractiveComponent>
```

### なぜインタラクティブではないコンポーネントに対してデフォルトのonXxx形式の属性を設定するべきではないのか

例として前述の `CrewDetail` を使って説明します。

```jsx
<CrewDetail onChange={onChange} />
```

上記例の場合、**CrewDetailの何が変更された場合利用される属性なのか？** がわかりません。<br />
`CrewDetail` という名称から **従業員詳細の何かが変わった場合** に利用されることは予測出来ますが、不明瞭です。<br />
おそらく入力要素ではないか？ということは予想できるかもしれませんが、例えばURLやDBに保存されている値の変更などの可能性もありえます。<br />
そのため**どんな用途で利用されるものか**を明確にした名称にすることを推奨しています。

```jsx
<CrewDetail onChangeName={onChange} />
```

逆にインタラクティブな要素・コンポーネントはそれ自体にイベントハンドラを設定する場合が多いため問題なくonXxx形式の属性を設定出来ます。

```jsx
<XxxInput onChange={onChange} />
```

このチェックはインタラクティブではないコンポーネントのみが対象のため、以下は対象外です。

- インタラクティブ・非インタラクティブを問わずすべての要素(a, divなどすべての要素)
- インタラクティブなコンポーネント(InputやXxxFormControlなどのコンポーネント)

対象となる属性は以下になります。

- onChange
- onInput
- onFocus
- onBlur
- onClick
- onDoubleClick
- onKeyDown
- onKeyUp
- onKeyPress
- onMouseEnter
- onMouseOver
- onMouseDown
- onMouseUp
- onMouseLeave
- onSelect
- onSubmit


## rules

```js
{
  rules: {
    'smarthr/best-practice-for-interactive-element': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
// button要素にrole="presentation"で意味付けを消してしまっていて大変危険なのでNG
<button role="presentation">...</button>
```

```jsx
// additionalInteractiveComponentRegex: ['^InteractiveComponent%']
// インタラクティブなコンポーネントとして扱われるものに対してrole="presentation"を指定しており危険なのでNG
<InteractiveComponent role="presentation">...</InteractiveComponent>
```

```jsx
// 非インタラクティブなコンポーネントと推測されるものにonXxxx形式のデフォルトに存在する属性を設定しているためNG
<CrewDetail onChange={onChange} />
```

## ✅ Correct

```jsx
// role属性を設定していないのでOK
<button>...</button>
```

```jsx
// additionalInteractiveComponentRegex: ['^InteractiveComponent%']
// インタラクティブなコンポーネントとして扱われるものに対してroleを指定していないのでOK
<InteractiveComponent any={hoge}>...</InteractiveComponent>
```

```jsx
// 非インタラクティブなコンポーネントと推測されるものにonXxxx形式のデフォルト属性ではない名前のイベントハンドラを設定しているのでOK
<CrewDetail onChangeName={onChange} />
```

```jsx
// インタラクティブな要素なのでonXxx形式のデフォルト属性を設定してもOK
<XxxInput onChange={onChange} />
```
