# smarthr/a11y-numbered-text-within-ol

"1. hoge", "2. fuga" ... のように連番のテキストはol要素でマークアップすることを促すルールです

## 連番のテキストをolでマークアップするメリット

ol要素でマークアップすることで連番テキストをもつ要素同士の関係、順番に意味があることを適切に表すことが出来ます。<br />
連番のテキストをol要素でマークアップすることは必須ではありませんが、このルールを導入することでマークアップの基準を揃えることができ、ユーザーに対する情報提供の方法が統一されます。

## 連番として扱われるテキスト

以下の条件に当てはまった場合、連番が設定されているテキストとして扱われます。

- 数値と数値以外の二文字が先頭にある文字列(Aとします)
- A以降で、Aに設定された数値+1の値を先頭にあり、かつその直後に数値以外の二文字がある文字列

## olとして扱われる要素・コンポーネント

以下はol要素として扱われます

- ol
- OrderedListが名称のsuffixにつくコンポーネント
  - 例: 
    - OrderedList
    - XxxOrderedList
    - XxxOrderedYyyList

## rules

```js
{
  rules: {
    'smarthr/a11y-numbered-text-within-ol': 'error', // 'warn', 'off',
  },
}
```

## ❌ Incorrect

```jsx
// ol要素で囲まれていないためNG
<Any>1. hoge</Any>
<Any>2. fuga</Any>
```

```jsx
// 属性でも同様にチェックする
<Any title="1. hoge" />
<Any title="2. fuga" />
```

```jsx
// ol要素内で連番を設定しているとNG
<OrderedList>
  <li>1. hoge</li>
  <li>2. fuga</li>
</OrderedList>
```

```jsx
// 同一のol要素で囲まれていないためNG
<OrderedList>
  <li>hoge</li>
</OrderedList>
<OrderedList>
  <li>fuga</li>
</OrderedList>>
```

## ✅ Correct

```jsx
<ol>
  <li>hoge</li>
  <li>fuga</li>
</ol>
```

```jsx
<OrderedList>
  <Any title="hoge" />
  <Any title="fuga" />
</OrderedList>
```

```jsx
// デフォルトの連番からフォーマット、スタイルを変更したい場合
// counter-reset + counter-increment で表現する
// 参考: [MDN CSS カウンターの使用](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_counter_styles/Using_CSS_counters)
<OrderedList>
  <li>
    <NumberedHeading>hoge</NumberedHeading>
    <Any />
  </li>
  <li>
    <NumberedHeading>fuga</NumberedHeading>
    <Any />
  </li>
</OrderedList>

...

const OrderedList = styled.ol`
  list-style: none; // デフォルトのstyleを消す
  counter-reset: hoge; // カウンターの名称。わかりやすいものなら何でもOK
`
const NumberedHeading = styled(Heading)`
  &::before {
    counter-increment: hoge; // hogeカウンターを+1する
    content: "No " counter(hoge) ": "; // 表示される連番のフォーマット
  }
`
```
