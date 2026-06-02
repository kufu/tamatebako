# smarthr/best-practice-for-lazy-variable

条件分岐内でのみ使用される変数を、使用箇所の直前に移動することを促すルールです。

変数が条件分岐（`if`, `switch`, 三項演算子, 論理演算子, optional chaining）内でのみ使われる場合、その直前または内部に移動することでコードの可読性とパフォーマンスを向上させます。

## なぜ変数を使用箇所の直前に移動すべきか

### 1. パフォーマンスの向上

条件分岐で実行されない可能性がある処理を事前に実行することは、無駄な計算を発生させる可能性があります。

```js
// 悪い例: conditionがfalseの場合、getExpensiveValue()は不要な計算
const value = getExpensiveValue()
someCode()
if (condition) {
  console.log(value)
}

// 良い例: conditionがtrueの場合のみgetExpensiveValue()を実行
someCode()
if (condition) {
  const value = getExpensiveValue()
  console.log(value)
}
```

### 2. 可読性の向上

変数が使用される箇所の近くで宣言することで、その変数の目的と使用方法が明確になります。

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-lazy-variable': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```js
// if文のbody内でのみ使用される変数
const x = getValue()
someCode()
if (condition) {
  console.log(x)
}
```

```js
// 条件部分で使用される変数
const x = getValue()
someCode()
if (x > 0) {
  doSomething()
}
```

```js
// switch文の単一caseでのみ使用される変数
const x = getValue()
someCode()
switch (condition) {
  case 'a':
    console.log(x)
    break
}
```

```js
// 三項演算子で使用される変数
const x = getValue()
someCode()
const y = condition ? x : 0
```

```js
// 論理演算子で使用される変数
const x = getValue()
someCode()
const y = condition && x
```

```js
// optional chainingで使用される変数
const x = getValue()
someCode()
const y = obj?.method(x)
```

## ✅ Correct

```js
// 条件分岐がない場合
const x = getValue()
console.log(x)
```

```js
// 条件分岐の外でも使われる
const x = getValue()
console.log(x)
if (condition) {
  console.log(x)
}
```

```js
// 複数の独立した条件分岐で使用される
const x = getValue()
if (condition1) {
  console.log(x)
}
if (condition2) {
  console.log(x)
}
```

```js
// switch文の複数のcaseで使用される
const x = getValue()
someCode()
switch (condition) {
  case 'a':
    console.log(x)
    break
  case 'b':
    console.log(x)
    break
}
```

```js
// ネストした条件分岐の複数箇所で使用される
const x = getValue()
if (condition1) {
  console.log(x)
  switch (condition2) {
    case 'a':
      console.log(x)
      break
  }
}
```

```js
// 関数スコープから参照される（異なるスコープ）
const x = getValue()
function foo() {
  if (condition) {
    console.log(x)
  }
}
```

```js
// すでに最適な位置（条件直前、間に何もない）
const x = getValue()
if (condition) {
  console.log(x)
}
```

```js
// React Hooks（useXxxで始まる関数）で初期化される変数
function Component() {
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])
  if (!condition) {
    return null
  }
  console.log(handleClick)
}
```

## autofix

このルールは自動修正に対応しています。

変数宣言は以下のように移動されます：

- **条件部分で使用される場合**: 条件文の直前に移動
- **body内でのみ使用される場合**: body内の最初の使用箇所の直前に移動
- **switch caseでblockが無い場合**: blockを自動的に追加して、その中に変数を移動

自動修正後はprettierやoxfmtなどのフォーマッターによってインデントや改行が整形されます。
