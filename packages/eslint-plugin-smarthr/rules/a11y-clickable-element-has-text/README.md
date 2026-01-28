# smarthr/a11y-clickable-element-has-text

ButtonやAnchor,Link コンポーネントなどクリック可能（クリッカブル）な要素にテキストを設定することを促すルールです。

## なぜクリッカブルな要素にテキストが必要なのか

スクリーンリーダーなどの一部のブラウザで**クリックした対象物が何であるか？という情報が欠落することを防ぐ**目的があります。  
閲覧可能なUI上では十分な情報が存在していても、テキスト読み上げなどでは情報が不足することがあるため、**クリックすることで起きる内容を説明する必要があります。**

## 適切なテキストの設定方法について

基本的にはchildrenにテキストを設定してください。

```jsx
<button>アクション</button>
```

変数を設定した場合もテキストを設定したものとして扱われます

```jsx
<AnyAnchor>{hoge}</AnyAnchor>
```

### 画像、もしくはそれに類する要素の場合

画像要素の場合は `alt` 等、代替テキストを設定してください。

```jsx
// 代替テキストを設定した画像を含むためOK
<AnyLink>
  <XxxImage alt="fuga" />
</AnyLink>
```

svg要素など、画像ではないが画像として扱いたい要素の場合、`role="img"` `aria-label="任意の文字列"` を指定することで**代替テキストが設定された画像**と同等に扱われるようになります。

```jsx
// svgだが代替テキストを設定した画像として扱うためOK
<AnyButton>
  <svg role="img" aria-label="HOGE">...</svg>
</AnyButton>
```

### 対象要素がそもそもテキストを内包している場合

a要素を拡張したコンポーネントがテキストを適切に内包している場合、childrenを設定しない状態で利用すればこのルールはcorrectとして扱います。

```jsx
// childrenが存在しないため、コンポーネントがテキストを内包しているものとして扱うのでOK
<HogeAnchor />
```

またchildrenにわたすコンポーネントがテキストを内包している場合、chilrenに渡すコンポーネントの名称のsuffixが `Text` になっていれば、correctとして扱われます。

```jsx
// children内に XxxText 形式のコンポーネントが渡されているのでOK
<AnyLink>
  <HogeText />
</AnyLink>
```

childrenにわたすコンポーネントの名称を変更することが難しい場合、lintのoptionとして `componentsWithText` に配列として完全一致するコンポーネント名を設定すれば、そのコンポーネントはテキストを含むものとして扱われます。

```jsx
// componentsWithText: ['Hoge'] を設定している場合
// Hogeコンポーネントはテキストを含むものとして扱われるのでOK
<XxxButton>
  <Hoge />
</XxxButton>
```

## rules

```js
{
  rules: {
    'smarthr/a11y-clickable-element-has-text': [
      'error', // 'warn', 'off'
      // {
      //   componentsWithText: ['AnyComponentName'],
      // },
    ]
  },
}
```

## ❌ Incorrect

```jsx
// テキストとみなされるものがchildrenに存在しないためNG
<XxxAnchor>
  <Xxx />
</XxxAnchor>
<XxxLink>
  <Yyy />
</XxxLink>
<XxxButton>
  <Zzz />
</XxxButton>
<XxxAnchor>
  <XxxTextYyyy />
</XxxAnchor>
```

## ✅ Correct

```jsx
// テキストがchildrenに含まれるためOK
<XxxAnchor>
  Hoge
</XxxAnchor>
```
```jsx
// テキスト以外が同時に含まれている場合もOK
<XxxLink>
  <YyyIcon />
  Fuga
</XxxLink>
```
```jsx
// 画像・Iconの場合、代替テキストが指定されていればテキストを含むものとして扱われるためOK
<XxxButton>
  <YyyImage alt="fuga" />
</XxxButton>
```

```jsx
// childrenが存在しないコンポーネントの場合、テキストを内包するものとして扱われるためOK
<YyyAnchor />
```

```jsx
// childrenに含むコンポーネント名が、TextがsuffixになっているためOK
<XxxAnchor>
  <XxxText />
</XxxAnchor>
```

```jsx
// componentsWithText: ['Hoge'] を設定している場合
// Hogeコンポーネントはテキストを含むものとして扱われるのでOK
<XxxButton>
  <Hoge />
</XxxButton>
```
