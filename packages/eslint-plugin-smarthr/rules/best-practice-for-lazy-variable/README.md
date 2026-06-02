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

### 基本的なパターン

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

### 早期終了のパターン

```js
// 早期終了（return）後にのみ使用される変数
function render() {
  const container = document.getElementById('root')
  if (!container) {
    return null
  }
  const theme = createTheme()
  const store = createStore()
  // theme, storeは早期終了されなかった場合にのみ必要
}
```

```js
// 早期終了（throw）後にのみ使用される変数
const container = document.getElementById('root')
if (!container) {
  throw new Error('Not found')
}
const theme = createTheme()
const store = createStore()
// theme, storeは早期終了されなかった場合にのみ必要
```

## ✅ Correct

### 移動不要なパターン

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

### 除外されるパターン

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

```js
// await式（非同期処理の順序を保持）
async function fetchData() {
  const result = await fetchAPI()
  someCode()
  if (result.status === 200) {
    console.log(result.data)
  }
}
```

```js
// ループ変数
for (const item of items) {
  const value = item.value
  if (condition) {
    console.log(value)
  }
}
```

## autofix

このルールは自動修正に対応しています。

### 移動パターン

#### 1. 条件文の直前への移動

条件部分で使用される変数は、条件文の直前に移動されます。

```js
// Before
const x = getValue()
someCode()
if (x > 0) {
  doSomething()
}

// After
someCode()
const x = getValue()
if (x > 0) {
  doSomething()
}
```

#### 2. 最初の使用箇所の直前への移動

条件分岐内で複数の文がある場合、最初に変数が使用される文の直前に移動されます。

```js
// Before
const x = getValue()
someCode()
if (condition) {
  console.log('start')
  console.log(x)
  doSomething()
}

// After
someCode()
if (condition) {
  console.log('start')
  const x = getValue()
  console.log(x)
  doSomething()
}
```

#### 3. switch文でのblock自動追加

blockが無いcaseには自動的にblockを追加して、その中に変数を移動します。

```js
// Before
const x = getValue()
someCode()
switch (condition) {
  case 'a':
    console.log(x)
    break
}

// After
someCode()
switch (condition) {
  case 'a': {
    const x = getValue()
    console.log(x)
    break
  }
}
```

#### 4. 早期終了後への移動

早期終了（return/throw）の後でのみ使用される変数は、早期終了文の直後に移動されます。

**returnの例:**

```js
// Before
function render() {
  const theme = createTheme()
  const container = document.getElementById('root')
  if (!container) {
    return null
  }
  const root = createRoot(container)
}

// After
function render() {
  const container = document.getElementById('root')
  if (!container) {
    return null
  }
  const theme = createTheme()
  const root = createRoot(container)
}
```

**throwの例:**

```js
// Before
const theme = createTheme()
const store = createStore()
const container = document.getElementById('root')
if (!container) {
  throw new Error('Not found')
}
const root = createRoot(container)

// After
const container = document.getElementById('root')
if (!container) {
  throw new Error('Not found')
}
const theme = createTheme()
const store = createStore()
const root = createRoot(container)
```

#### 5. 複数case fallthroughへの対応

複数のcaseラベルが同じ処理を共有している場合も正しく処理されます。

```js
// Before
const serverError = response.data
switch (response.status) {
  case 400:
  case 404:
    if (serverError.code === 'ERROR') {
      console.log(serverError.message)
    }
    break
}

// After
switch (response.status) {
  case 400:
  case 404: {
    const serverError = response.data
    if (serverError.code === 'ERROR') {
      console.log(serverError.message)
    }
    break
  }
}
```

### フォーマット

自動修正後はprettierやoxfmtなどのフォーマッターによってインデントや改行が整形されます。
