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
- 関数呼び出し (`CallExpression`) ※引数がある場合のみ
- プロパティアクセス (`MemberExpression`)
- 二項演算子 (`BinaryExpression`)
- 論理演算子 (`LogicalExpression`)
- new式 (`NewExpression`)
- スプレッド構文 (`SpreadElement`)
- 型アサーション (`TSAsExpression`, `TSTypeAssertion`)
- 型注釈 (TypeScript: `const x: Type = ...`)

**複雑さ +0:**
- 引数なし関数呼び出し (`getValue()`, `Date.now()` など)

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
// 変数の式: obj.method() = 1 (MemberExpression) ※引数なしCallExpressionは0
// 使用箇所: console.log(x) = 2 (MemberExpression + CallExpression)
// 総合複雑さ: 3
const result = obj.method()
console.log(result)
// → maxComplexity: 5 なのでインライン化される

// 引数ありの場合
// 変数の式: obj.method(arg) = 2 (MemberExpression + CallExpression)
// 使用箇所: console.log(x) = 2
// 総合複雑さ: 4
const result = obj.method(arg)
console.log(result)
// → maxComplexity: 5 なのでインライン化される
```

**return文の特別扱い:**
- `return x` の形式（単一変数を返す場合）のみ、変数の式の複雑さチェックをスキップ
- 使用箇所の複雑さのみでチェック

```js
// return文で単一変数を返す場合
function foo() {
  const result = obj.method().another().property  // 複雑さ 3 (MemberExpression x3、引数なしCallExpression x2は0)
  return result  // 使用箇所の複雑さ 0
}
// → 総合複雑さ 0 なのでインライン化される

// return文で式を含む場合（特別扱いされない）
function bar() {
  const result = obj.method()  // 複雑さ 1 (MemberExpression、引数なしCallExpressionは0)
  return result.property  // 使用箇所の複雑さ 1
}
// → 総合複雑さ 2 なのでインライン化される（maxComplexity: 5）
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
// TaggedTemplateExpression（styled componentなど）
const StyledDiv = styled.div`
  color: red;
`
console.log(StyledDiv)
```

```js
// export宣言された変数は除外（他のファイルから参照される可能性があるため）
export const API_URL = 'https://example.com/api'
export type Config = typeof API_URL
```

```js
// UPPER_SNAKE_CASE形式の定数は除外（慣習的な定数命名）
const NULL = { label: '', value: '' }
console.log(NULL)

const API_BASE_URL = 'https://example.com'
fetch(API_BASE_URL)
```

```js
// 複雑な式は除外（デフォルト maxComplexity: 5）
// 複雑さ 6 (MemberExpression x2 + CallExpression x1 + ArrowFunction x2 + 引数なしCallExpression x1は0) + console.log (複雑さ 2) = 8
const result = array.map(() => obj.method())
console.log(result)
```

```js
// var宣言は除外（スコープの扱いが複雑なため）
var x = getValue()
console.log(x)
```

```js
// 分割代入は除外（将来的に対応予定: object, array両方）
const { name } = user
console.log(name)
```

```js
// ループの宣言部分で定義される変数（for-in, for-of, for文のinit）
for (const item of items) {
  console.log(item)
}

for (let i = 0; i < 10; i++) {
  console.log(i)
}
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

```js
// 単項演算子で使用される場合も括弧が必要
// Before
const isNothing = value === 'nothing'
if (!isNothing) allN = false

// After
if (!(value === 'nothing')) allN = false
```

```js
// ExpressionStatementの先頭で使用される場合、セミコロンを前置
// Before
inputs[0].focus()
const input = inputs[0]
input.setSelectionRange(0, 0)

// After
inputs[0].focus()
;inputs[0].setSelectionRange(0, 0)
```

**注意:** セミコロンの前置は、前の文とのメソッドチェーンを防ぐために行われます。

### 型注釈の保持（TypeScript）

TypeScriptで型注釈が付いている変数は、インライン化時に`as`型アサーションとして型情報が保持されます。

```ts
// Before
const value: string = getValue()
console.log(value)

// After
console.log((getValue() as string))
```

```ts
// Before
function getUser() {
  const user: User | null = fetchUser()
  return user
}

// After
function getUser() {
  return (fetchUser() as User | null)
}
```

**注意:** 型注釈は複雑度+1として計算されます。

### 複数変数宣言への対応

複数の変数を同時に宣言している場合、対象の変数のみが削除されます。

```js
// Before
const x = 1, y = getValue(), z = 3
console.log(y)

// After
const x = 1, z = 3
console.log(getValue())
```

### フォーマット

自動修正後はprettierやoxfmtなどのフォーマッターによってインデントや改行が整形されます。
