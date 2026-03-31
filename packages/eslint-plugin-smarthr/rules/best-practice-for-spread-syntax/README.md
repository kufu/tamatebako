# smarthr/best-practice-for-spread-syntax

spread syntax（`{ ...b }`のようにオブジェクトを展開する記述）を通常の属性より先に記述することを促すルールです。

## なぜspread syntaxを先に書くべきなのか

spread syntaxを通常の属性より後に記述すると、**spread syntaxで値が上書きされる**可能性があります。

```jsx
const AnyComponent = (props: Props) => {
  ...
  return <Fuga id="ABC" {...props} />
}
```

### 問題点

上記の例では、以下の確認が必要になります:

- **Props型がidを含むか？**
- **idが必須か？**
- **propsでidが指定された場合、どちらが優先されるか？**

特に`id`など、HTMLの要素が持つ属性と名前が被っている場合、意図せず上書きされてしまう問題が発生する可能性が高く危険です。

また、コードから「デフォルト値なのか、固定値なのか」が一目でわからず、広範囲の確認が必要になりがちです。

### 推奨する記法

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

このように書くことで:

- **spread syntaxによる意図せぬ上書きを回避できる**
- **コードとしてデフォルト値なのか、固定値なのかが一目でわかる**

### オブジェクトの場合も同様

例ではJSXを使用しましたが、通常のオブジェクトの場合も同様にチェックします:

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

## 自動修正について

eslintを`--fix`オプション付きで実行する際、`fix`オプションを`true`にすると自動修正します。

```js
{
  rules: {
    'smarthr/best-practice-for-spread-syntax': [
      'error',
      { fix: true },
    ]
  },
}
```

### ⚠️ 自動修正の注意点

自動修正は属性の並び替えだけを行うため、**spread syntaxによって上書きすることを期待していたロジックが狂う可能性があります**。

自動修正を使う前に、手動で確認することを推奨します。

## チェック対象の制限

JSXのspread attributesのみ、もしくはObjectのspread syntaxのみをチェック対象にしたい場合、`checkType`オプションを指定できます:

```js
{
  rules: {
    'smarthr/best-practice-for-spread-syntax': [
      'error',
      {
        checkType: 'only-jsx', // または 'only-object'
      },
    ]
  },
}
```

- `'always'` (デフォルト) - JSXとObjectの両方をチェック
- `'only-jsx'` - JSXのみチェック
- `'only-object'` - Objectのみチェック

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
