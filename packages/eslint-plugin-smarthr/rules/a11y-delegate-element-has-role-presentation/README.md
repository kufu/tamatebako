# smarthr/a11y-delegate-element-has-role-presentation

'role="presentation"'を適切に設定することを促すルールです。

## role="presentation" とは何か

role属性はhtmlの要素の意味(role)を変更するための属性です。  
すべてのhtmlの要素はデフォルトの属性を持っており、**基本的にrole属性を利用することは推奨されません**。  
不用意に利用した場合、ブラウザが適切な解釈を行うことが出来ず、必要な機能が有効にならない、などの問題が発生する可能性があります。

特に`role="presentation"`は **設定した要素は見た目やJSで利用するためのもので意味づけはない** という設定になるため大変強力な設定になります。  
そのためこのルールも基本的には**特に問題が起きやすい、インタラクティブな要素に対して`role="presentation"`を使っていたら忠告する**ことを目的としたものになっています。  
（インタラクティブな要素とは `form` `input`などの入力要素と `button` `a` などのクリッカブルな要素を指します）

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


## role="presentation" を設定するべきパターン

基本的に `role` ひいては `role="presentation"` は利用するべきではありませんが、例外として**インタラクティブな要素から発生するイベントを親の非インタラクティブな要素でキャッチ(delegate)する場合、親要素に 'role="presentation"' を設定する** ことを推奨します。

```jsx
<div onClick={onClick} role="presentation">
  <button>click 1</button>
  <button>click 2</button>
  ...
</div>
```

上記のような場合、ブラウザによってdiv要素に暗黙のroleが設定される場合があり、div要素が何か意味があるかもしれないとして扱われてしまうことを防ぐ目的で `role="presentation"` を指定しています。  
`role="presentation"` の設定によって、対象要素はdelegateのための要素であり、意味付けは必要ないことが明確になります。

このチェックでは**インタラクティブではない要素でイベントをキャッチしており、かつ'role="presentation"'を設定しているにも関わらず、子要素にインタラクティブな要素がない場合はエラーになります。**

```jsx
// Hogeはインタラクティブな要素ではないと予測されるためNG
<div onClick={onClick} role="presentation">
  <Hoge />
</div>
```

上記の場合、Hogeがインタラクティブな要素を含むコンポーネントならば前述のadditionalInteractiveComponentRegexオプションを利用してください。

```jsx
// additionalInteractiveComponentRegex: ['^Hoge%']
// Hogeはインタラクティブな要素として扱われるよう設定されているためOK
<div onClick={onClick} role="presentation">
  <Hoge />
</div>
```

## コンポーネントに設定するイベントハンドラの名称について

上記した `role="presentation"を設定するべきパターン` の対応のため、onClick, onChangeなどのjavascriptデフォルトのイベントハンドラをコンポーネントの属性として利用する場合、エラーになる場合があります。

```jsx
// 例えばCrewDetailというコンポーネントにonChangeを設定した場合、デフォルトではCrewDetailはインタラクティブなコンポーネントではないため、NGになる
<CrewDetail onChange={onChange} />
```

これを回避するためには前述のadditionalInteractiveComponentRegexオプションを利用することも出来ますが、onChange属性の名称を変更することでも対応できます。

```jsx
// 例えばonChangeが `従業員の氏名変更で利用される` イベントハンドラの場合
<CrewDetail onChangeName={onChange}>
```

上記のように **なんのために利用されるイベントハンドラなのか？** がわかる名称にすることでコードの可読性が上がるため、属性の名称を変更する対応を推奨しています。  
チェック対象となる属性名は以下のとおりです。

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
    'smarthr/a11y-delegate-element-has-role-presentation': [
      'error', // 'warn', 'off'
      // { additionalInteractiveComponentRegex: ['^InteractiveComponent%'] }
    ]
  },
}
```

## ❌ Incorrect

```jsx
// インタラクティブな要素に対して role="presentation" は設定できない
<Button role="presentation">text.</Button>
<input type="text" role="presentation" />
```

```jsx
// 非インタラクティブな要素にデフォルトで存在するonXxx形式の属性を設定するとエラー
// 設定する場合、は onXxxx のsuffixに"なんのために利用するのか" がわかる名称を追加するか、
// 最終手段として`role="presentation"` を設定する
<CrewDetail onChange={onChange} />
```

```jsx
// インタラクティブな要素で発生するイベントを非インタラクティブな要素でキャッチする場合
// role="presentation" を設定する必要がある
<div onClick={hoge}>
  <Button>text.</Button>
</div>
```

```jsx
// 非インタラクティブな要素でイベントをキャッチする場合、
// 子要素にインタラクティブな要素がない場合はエラー
<div onClick={hoge} role="presentation">
  <Text>hoge.</Text>
</div>
```

## ✅ Correct

```jsx
// インタラクティブな要素で発生するイベントを非インタラクティブな要素でキャッチする場合
// role="presentation" を設定する
<div onClick={hoge} role="presentation">
  <Button>text.</Button>
</div>

<div onClick={hoge} role="presentation">
  <AnyForm />
</div>
```

```jsx
// デフォルトのonXxxx形式の属性ではなく、どこで利用されるのかが明確な属性に対して設定しているためOK
<CrewDetail onChangeName={onChangeName} />
```
