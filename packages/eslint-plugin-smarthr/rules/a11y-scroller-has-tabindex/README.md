# smarthr/a11y-scroller-has-tabindex

scroll可能な要素にtabindex属性を設定することを推奨し、インタラクティブでない要素に不要なtabindex属性が設定されていないかをチェックするルールです。

## チェック内容

このルールは以下の3つのチェックを行います：

1. scroll可能な要素（overflow-auto、overflow-scrollなどのクラスを持つ要素）にtabIndex={0}が設定されているか
2. tabindex属性に0, -1以外の値（1以上の値）が設定されていないか
3. インタラクティブでない要素に不要なtabindex属性が設定されていないか

## なぜscroll可能な要素にtabindex属性を設定するべきなのか

ポインティングデバイス(マウスやタッチパッドなど)以外を利用しているユーザーの利便性が向上します。<br />
tabindex属性を設定することでキーボードのtabキーで移動する際、scroll可能な要素にfocusされるようになり、キーボード操作が容易になります。<br />

Chromeなど、一部のモダンブラウザではscroll可能な要素内にfocus可能な要素(入力要素など)がある場合、自動的にscroll可能な要素にもfocusする場合があります。<br />
しかしこの挙動はブラウザによって異なりますし、scroll可能な要素内にfocus可能な要素がない場合はfocusしない挙動をするブラウザが多いため、tabindex属性を設定することが推奨されます。

### tabindex属性に1以上の値をつけることの問題について

このルールではtabindex属性に-1, 0以外の値を設定する場合もエラーにします。<br />
tabindex属性に1以上の値を設定すると**tab移動可能な要素の中で優先的に移動してしまう**ためです。<br />
デフォルトでfocus可能な要素やtabindex="0"が設定されている要素を飛ばしてfocusされるようになるためページを理解するうえで重要な内容が把握されづらくなる可能性があります。<br />
HTMLはその構造上、基本的に記述順が早いほど重要な情報である可能性が高く、不必要にtabindex属性に1以上の値を設定すると問題になる場合があります。<br />
基本的に0(デフォルトでtab移動可能な要素と同じ設定)、-1(tab移動できなくする)以外の値は設定しないでください。

### インタラクティブでない要素にtabindex属性を設定することの問題について

tabindex属性は本来、インタラクティブな要素（ボタン、入力フィールドなど）やscroll可能な要素に設定するべきものです。<br />
通常のdivやspanなどの非インタラクティブな要素にtabindex属性を設定すると、キーボードナビゲーションの際に不要な要素にフォーカスが当たってしまい、ユーザー体験が低下する可能性があります。<br />
このルールは、インタラクティブでない要素（button、input、a要素などではない要素）に不要なtabindex属性が設定されていないかをチェックします。<br />
ただし、overflow系のclassName（overflow-auto、overflow-scrollなど）を持つ要素は、scroll可能な要素として例外的に許可されます。

## smarthr-ui/Scrollerコンポーネントの推奨

scroll可能な要素を実装する場合、smarthr-ui/Scrollerコンポーネントの利用を推奨します。<br />
Scrollerコンポーネントはtabindex属性を自動的に設定するため、手動でtabIndexを設定する必要がなく、アクセシビリティ対応が容易になります。


## rules

```js
{
  rules: {
    'smarthr/a11y-scroller-has-tabindex': [
      'error', // 'warn', 'off'
    ]
  },
}
```

## ❌ Incorrect

```jsx
// scroll可能な要素にはtabindex={0}を指定する必要がある
<Any className="overflow-y-auto">
  <Table />
</Any>
```

```jsx
// tabindexが0以外の場合はエラー
<Any className="overflow-x-scroll" tabIndex={1}>
  <Table />
</Any>
```

```jsx
// scroll可能な要素ではない場合でもtabindexが0,-1以外の場合はエラー
<Any tabIndex={1} />
```

```jsx
// インタラクティブでない要素に不要なtabindex属性が設定されている
<div tabIndex={0}>
  <p>テキスト</p>
</div>
```

```jsx
// インタラクティブでない要素に不要なtabindex属性が設定されている
<Stack tabIndex={0}>
  <Text>コンテンツ</Text>
</Stack>
```

## ✅ Correct

```jsx
// scroll可能な要素にtabIndex={0}が設定されている
<Any className="overflow-y-auto" tabIndex={0}>
  <Table />
</Any>
```

```jsx
// 有効な値（-1）が設定されている
<Any tabIndex={-1} />
```

```jsx
// インタラクティブな要素（button）にはtabIndexを設定してもOK
<button tabIndex={0}>クリック</button>
```

```jsx
// インタラクティブな要素（input）にはtabIndexを設定してもOK
<input tabIndex={-1} />
```

```jsx
// scroll可能な要素にtabIndexが設定されている
<div className="overflow-auto" tabIndex={0}>
  <Table />
</div>
```

```jsx
// smarthr-ui/Scrollerコンポーネントを利用（推奨）
// tabIndexは自動的に設定されるため手動設定不要
<Scroller>
  <Table />
</Scroller>
```
