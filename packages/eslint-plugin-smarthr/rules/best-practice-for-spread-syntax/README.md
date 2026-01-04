# smarthr/best-practice-for-spread-syntax

- 意図しない属性の上書きを防ぐため、spread syntax({ ...b } のようにjs, jsxでオブジェクトを展開する記述)を通常の属性より先に記述するよう促すruleです
- eslint を `--fix` オプション付きで実行する際、 fix オプション を true にすると自動修正します
  - !!! 要注意 !!! 自動修正は属性の並び替えだけ行うため、spread syntaxによって上書きすることを期待していたロジックが狂う可能性があります
- jsxのspread attributesのみ、objectのspread sytaxのみチェック対象にしたい場合、checkTypeオプションに only-jsx, only-object を指定してください

# spread syntax を通常の属性より後に記述した場合に発生する問題

spread syntaxより先に通常の属性を記述した場合、** spread syntaxで値が上書きされる ** 可能性があります。

```jsx
const AnyComponent = (props: Props) => {
  ...
  return <Fuga id="ABC" {...props} />
}
```

上記例の場合、** Props型がidを含むか? 含む場合必須か？などの確認 ** が必要になります。
(idが必須の場合、Fugaにベタ書きしているidがそもそも不要になるため)
また`idのデフォルト値が"ABC", propsでidが指定された場合そちらを優先` というロジックが必要かどうかを該当コードの部分だけで判断出来ず、広範囲の確認が必要になりがちです。
特にidなど多用され、HTMLの要素が持つ属性と名前が被っている場合、意図せず上書きされてしまう問題が発生する可能性が高く危険です。
そのため下記の様に記述することを推奨します。

```jsx
// propsがidを含む可能性がある場合
const AnyComponent = (props: Props) => {
  ...
  return <Fuga {...props} id={props.id || 'ABC'} />
}

// propsがidを含む可能性がない場合(もしくはidを固定値にしたい場合)
const AnyComponent = (props: Props) => {
  ...
  return <Fuga {...props} id="ABC" />
}
```

推奨の記法では

- spread syntaxによる意図せぬ上書きを回避できる
- コードとしてデフォルト値なのか、固定値なのかが一目でわかる

などのメリットがあります。

例ではjsxを使用しましたが、通常のオブジェクトの場合も同様にチェックします

```js
// NG例
const obj = {
  fuga: 'piyo',
  ...hoge,
}

// OK例
const obj = {
  ...hoge,
  fuga: hoge.fuga || 'piyo',
}
```


## rules

```js
{
  rules: {
    'smarthr/best-practice-for-spread-syntax': [
      'error', // 'warn', 'off'
      {
        fix: false // true
        // 個別に対象指定する場合(default always)
        // checkType: 'always', // only-jsx, only-object
      },
    ]
  },
}
```

## ❌ Incorrect

```jsx
<AnyComponent hoge="hoge" {...props} />
```

```jsx
<AnyComponent {...fuga} hoge="hoge" {...piyo} />
```

```jsx
const obj = {
  fuga: 'piyo',
  ...hoge,
}
```

## ✅ Correct

```jsx
<AnyComponent {...props} hoge="hoge" />
```

```jsx
<AnyComponent {...props} hoge={props.hoge || "hoge"} />
```

```jsx
<AnyComponent {...fuga} {...piyo} hoge="hoge" />
```

```jsx
const obj = {
  ...hoge,
  fuga: hoge.fuga || 'piyo',
}
```
