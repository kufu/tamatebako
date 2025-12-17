# smarthr/best-practice-for-rest-parameters

- 残余引数(rest parameters)の命名規則を設定するルールです
  - https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Functions/rest_parameters
- 残余引数にはrestという名称を設定することを推奨します
  - よく利用される `props` という名称と完全一致する場合、エラーになります
    - コンポーネントが受け取れる属性を定義する際、多用される "Props" 型と勘違いされる可能性を減らすためです
    - 残余引数の時点でコンポーネントが受け取れる属性全てではないことが確定するためpropsの利用を禁止しています
    - `xxxProps` のように他単語と組合されている場合はエラーになりません
- 残余引数以外でrestという名称と完全一致する設定することを禁止します
  - restは rest parametersから命名されたjsのイディオムのため、残余引数以外の箇所で利用すると混乱を招くためです
    - `xxxRest` のように他単語と組合されている場合はエラーになりません

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-rest-parameters': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```js
// 残余引数にpropsという名称が設定されているためNG
const hoge = (a, b, ...props) => {
  // any
}

// オブジェクトの残余引数の場合も同様のチェックを行うためNG
const hoge = ({ a, b, ...props }) => {
  // any
}

// 残余引数ではない箇所でrestという文字列と完全一致する場合NG
const hoge = (a, rest, b) => {
  // any
}
// 引数以外の場合でも混乱するためNG
const rest = { /* any */ }
```

## ✅ Correct


```js
// 残余引数にrestという名称が設定されておりOK
const hoge = (a, b, ...rest) => {
  // any
}
// 残余引数でもprops以外は許容
const hoge = ({ a, b, ...actionButtonProps }) => {
  // any
}

// 残余引数以外の場合はpropsを許容
const hoge = (props) => {
  // any
}
const props = { /* any */ }
```
