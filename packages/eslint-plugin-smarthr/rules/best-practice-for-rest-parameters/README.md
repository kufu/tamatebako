# smarthr/best-practice-for-rest-parameters

- 残余引数(rest parameters)の命名規則を設定するルールです
  - https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Functions/rest_parameters
- 残余引数にはrestという名称を設定することを推奨します
  - よく利用される `props` などを利用するとエラーになります
    - コンポーネントが受け取れる属性を定義する際、多用される "Props" 型と勘違いされる可能性を減らすためです
    - 残余引数の時点でコンポーネントが受け取れる属性全てではないことが確定するためpropsの利用を禁止しています
    - `rest` という名称に揃えることで可読性を向上させることが出来ます
  - restがすでに利用されており設定出来ない場合 `xxxRest` というフォーマットが利用出来ます
- 残余引数以外でrest、もしくはxxxRestというフォーマットの名称を設定することを禁止します
  - restは rest parametersから命名されたjsのイディオムのため、残余引数以外の箇所で利用すると混乱を招くためです
- 残余引数内の属性を直接参照することを禁止します
  - 例: `const hoge = rest.fuga`
  - 例: `const { hoge } = rest`
  - この条件を守る場合、残余引数がそのスコープ内で関心が薄い引数の集まりになり、可読性が向上します

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
// 残余引数にrest、xxxRest以外の名称が利用されているためNG
const hoge = (a, b, ...props) => {
  // any
}

// オブジェクトの残余引数の場合も同様のチェックを行うためNG
const hoge = ({ a, b, ...props }) => {
  // any
}

// 残余引数ではない箇所で残余引数と勘違いしかねない命名がされているためNG
const hoge = (a, anyRest, b) => {
  // any
}
// 引数以外の場合でも混乱するためNG
const hogeRest = { /* any */ }

// 残余引数内の属性を参照しているためNG
const ComponentA = ({ a, b, ...rest }) => {
  ...

  if (rest.abc) {
    return <Children {...rest} />
  }

  ...
}
const ComponentB = ({ a, b, ...rest }) => {
  ...

  // 残余引数を構造分解することもNG
  const { abc } = rest

  if (abc) {
    return <Children {...rest} />
  }

  ...
}
```

## ✅ Correct


```js
// 残余引数にrestという名称が設定されておりOK
const hoge = (a, b, ...rest) => {
  // any
}
const fuga = ({ a, b, ...anyRest }) => {
  // any
}

// 残余引数ではない場合、rest以外の名称を許容
const hoge = (props) => {
  // any
}
const props = { /* any */ }

// 残余引数内の属性を参照しないようにコードが書かれているため許容
// HINT: 残余引数がそのスコープ内で関心が薄い引数の集まりになり、可読性が向上します
const Component = ({ a, b, abc, ...rest }) => {
  ...

  if (abc) {
    return <Children {...rest} abc={abc} />
  }

  ...
}
```
