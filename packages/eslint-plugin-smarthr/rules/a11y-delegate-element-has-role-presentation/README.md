# smarthr/a11y-delegate-element-has-role-presentation

'role="presentation"'を適切に設定することを促すルールです。

## role="presentation" とは何か

role属性はhtml要素の意味(role)を変更するための属性です。  
すべての属性はデフォルトの属性を持っており、**基本的にrole属性を利用することは推奨されません**。  
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
`role="presentation"` の設定によって、delegate用のdivはdelegateのための要素であり、マークアップによる意味付けはないことが明確になります。

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
