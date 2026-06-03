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

## ❌ Incorrect

```js
// 一度しか使わない変数
const x = getValue()
console.log(x)
```

```js
// return文で一度だけ使用
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

### フォーマット

自動修正後はprettierやoxfmtなどのフォーマッターによってインデントや改行が整形されます。
