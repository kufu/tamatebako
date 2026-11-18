# smarthr/best-practice-for-rest-parameters

- 残余引数(rest parameters)の利用方法を設定するルールです
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
- 残余引数と同時に分割代入したプロパティを、変更せずに`{...rest}`と同じ箇所(JSX要素・オブジェクト)にそのまま渡し直しているだけの場合、分割代入自体が不要なためエラーになります
  - 例: `({ propA, ...rest }) => <Foo {...rest} propA={propA} />`
  - `propA`を分割代入せず`rest`に残しておけば、`{...rest}`経由で自動的に転送されるため、わざわざ取り出して書き戻す必要がありません
  - 対象は以下をすべて満たす場合のみです(誤検知防止のため意図的に限定しています)
    - リネーム(`{ propA: aliased }`)・デフォルト値(`{ propA = false }`)付きの分割代入は対象外
    - `propA`がコンポーネント本体内で他にも参照されている場合は対象外(例: 条件分岐で使っている場合)
    - `{...rest}`と`propA`の受け渡しが別々のJSX要素・オブジェクトにある場合は対象外

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-rest-parameters': ['error', { fix: false }], // 'warn', 'off'
  },
}
```

## options

### fix

残余引数と同時に分割代入したプロパティを冗長に渡し直しているケースの自動修正を有効にするかどうかを指定します。

**デフォルト値**: `false`

```js
{
  rules: {
    'smarthr/best-practice-for-rest-parameters': ['error', { fix: true }],
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

// propAを分割代入せずrestに残せば自動転送されるため、わざわざ渡し直しているのはNG
const TableScroller = ({ children, fixedHead, ...rest }) => (
  <ScrollerSwitcher {...rest} fixedHead={fixedHead}>{children}</ScrollerSwitcher>
)

// オブジェクトの場合も同様にNG
const useFunctions = ({ onClick, ...rest }) => {
  return { ...rest, onClick }
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

// propAが他でも参照されている場合は対象外(インライン化できないため)
const Component2 = ({ propA, ...rest }) => {
  if (propA) {
    return <Children {...rest} propA={propA} />
  }
}

// {...rest}とpropAの受け渡しが別々の要素にある場合は対象外
const Component3 = ({ propA, ...rest }) => (
  <Parent {...rest}>
    <Child propA={propA} />
  </Parent>
)
```

## autofix

このルールは自動修正に対応しています。自動修正を有効にするには `fix: true` オプションを指定してください。

```js
// Before
const TableScroller = ({ children, fixedHead, ...rest }) => (
  <ScrollerSwitcher {...rest} fixedHead={fixedHead}>{children}</ScrollerSwitcher>
)

// After
const TableScroller = ({ children, ...rest }) => (
  <ScrollerSwitcher {...rest}>{children}</ScrollerSwitcher>
)
```

### フォーマット

自動修正後はprettierやoxfmtなどのフォーマッターによってインデントや改行が整形されます。

