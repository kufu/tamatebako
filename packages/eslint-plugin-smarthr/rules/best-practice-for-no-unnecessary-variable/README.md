# smarthr/best-practice-for-no-unnecessary-variable

一度しか使用されない変数を直接使用することを促すルールです。

不要な変数を作らず、値を直接使用することでコードの可読性とパフォーマンスを向上させます。

## なぜ不要な変数を避けるべきか

### 1. 可読性の向上

一度しか使わない変数は、コードを読む際の認知負荷を増やします。

```js
// 悪い例: 不要な変数が読みやすさを阻害
const value = obj.property
return value

// 良い例: 直接使用で意図が明確
return obj.property
```

### 2. パフォーマンスの向上

不要な変数宣言とメモリ割り当てを削減します。

## 前提条件

このルールは `best-practice-for-lazy-variable` ルールが適用済みであることを前提としています。
両ルールを組み合わせることで、最適な変数配置とインライン化を実現します。

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-lazy-variable': 'error',
    'smarthr/best-practice-for-no-unnecessary-variable': 'error',
  },
}
```

## options

### maxComplexity

式の複雑さの合計が `maxComplexity` を超える場合、インライン化を行いません。

**デフォルト値**: `5`

```js
{
  rules: {
    'smarthr/best-practice-for-no-unnecessary-variable': ['error', { maxComplexity: 5 }],
  },
}
```

#### 複雑さの計算方法

**複雑さ +1:**
- 関数呼び出し (`CallExpression`)
- プロパティアクセス (`MemberExpression`)
- 二項演算子 (`BinaryExpression`)
- 論理演算子 (`LogicalExpression`)
- new式 (`NewExpression`)
- スプレッド構文 (`SpreadElement`)
- 型アサーション (`TSAsExpression`, `TSTypeAssertion`)

**複雑さ +2:**
- 三項演算子 (`ConditionalExpression`)
- オブジェクトリテラル (`ObjectExpression`)
- 配列リテラル (`ArrayExpression`)
- アロー関数 (`ArrowFunctionExpression`)
- 関数式 (`FunctionExpression`)
- JSX要素 (`JSXOpeningElement`)

#### 複雑さのチェック方法

**総合複雑さ = 変数の式の複雑さ + 使用箇所の複雑さ**

```js
// 変数の式: obj.method() = 2 (MemberExpression + CallExpression)
// 使用箇所: console.log(x) = 2 (MemberExpression + CallExpression)
// 総合複雑さ: 4
const result = obj.method()
console.log(result)
// → maxComplexity: 5 なのでインライン化される
```

**return文の特別扱い:**
- `return x` の形式（単一変数を返す場合）のみ、変数の式の複雑さチェックをスキップ
- 使用箇所の複雑さのみでチェック

```js
// return文で単一変数を返す場合
function foo() {
  const result = obj.method().another().property  // 複雑さ 3
  return result  // 使用箇所の複雑さ 0
}
// → 総合複雑さ 0 なのでインライン化される

// return文で式を含む場合（特別扱いされない）
function bar() {
  const result = obj.method()  // 複雑さ 2
  return result.property  // 使用箇所の複雑さ 1
}
// → 総合複雑さ 3 なのでインライン化される（maxComplexity: 5）
```

## ❌ Incorrect

```js
// 一度しか使わない変数
const x = getValue()
console.log(x)
```

```js
// return文で単一変数を返す
function foo() {
  const result = calculateValue()
  return result
}
```

```js
// 関数の引数で一度だけ使用
const data = getData()
process(data)
```

```js
// 複雑さが低い式（総合複雑さ 4 ≤ maxComplexity: 5）
const obj = { a: 1, b: 2 }  // ObjectExpression: 2
console.log(obj)  // console.log: 2
```

```js
// JSX要素（総合複雑さ 4 ≤ maxComplexity: 5）
const element = <div>Hello</div>  // JSXOpeningElement: 2
render(element)  // render: 1 + CallExpression: 1
```

## ✅ Correct

### インライン化されたパターン

```js
// 直接使用
console.log(getValue())
```

```js
// return文で直接使用
function foo() {
  return calculateValue()
}
```

### 除外されるパターン

```js
// 2回以上使用される変数
const x = getValue()
console.log(x)
return x
```

```js
// ループ内で使用される変数
const x = getValue()
for (let i = 0; i < 10; i++) {
  console.log(x)
}
```

```js
// 関数スコープ内で使用される変数
const x = getValue()
array.forEach(() => {
  console.log(x)
})
```

```js
// React Hooks（useXxxで始まる関数）で初期化される変数
function Component() {
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])
  return handleClick
}
```

```js
// await式を含む変数
async function fetchData() {
  const result = await fetchAPI()
  console.log(result)
}
```

```js
// アロー関数・関数式は除外（可読性低下を防ぐため）
const getTitle = () => {
  return condition ? 'A' : 'B'
}
console.log(getTitle())
```

```js
// export宣言された変数は除外（他のファイルから参照される可能性があるため）
export const API_URL = 'https://example.com/api'
export type Config = typeof API_URL
```

```js
// 複雑な式は除外（デフォルト maxComplexity: 5）
// 複雑さ 6 (MemberExpression x2 + CallExpression x2 + ArrowFunction x2) + console.log (複雑さ 2) = 8
const result = array.map(() => obj.method())
console.log(result)
```

```js
// 分割代入は除外（将来的に対応予定: object, array両方）
const { name } = user
console.log(name)
```

```js
// 初期化なしの変数
let x
if (condition) {
  x = getValue1()
} else {
  x = getValue2()
}
console.log(x)
```

## autofix

このルールは自動修正に対応しています。

```js
// Before
const x = getValue()
console.log(x)

// After
console.log(getValue())
```

### 括弧の追加

一部の式タイプでは、インライン化時に括弧が自動的に追加されます。

```js
// Before
const result = condition ? value1 : value2
doSomething(result)

// After
doSomething((condition ? value1 : value2))
```

```js
// Before
const input = element as HTMLInputElement
return input

// After
return (element as HTMLInputElement)
```

```js
// Before
const obj = { a: 1, b: 2 }
console.log(obj.property)

// After
console.log(({ a: 1, b: 2 }).property)
```

### フォーマット

自動修正後はprettierやoxfmtなどのフォーマッターによってインデントや改行が整形されます。
