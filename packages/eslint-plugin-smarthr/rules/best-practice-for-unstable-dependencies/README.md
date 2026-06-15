# best-practice-for-unstable-dependencies

React Hooksの依存配列に不安定な参照（オブジェクト、配列、関数、ReactNodeなど）を含めることを禁止します。

これらの値は参照が頻繁に変わるため、依存配列に含めると不要な再実行や無限ループの原因となります。

## 対象となる不安定な参照

- **ReactNode**: `children`、`icon`、`prefix`など
- **オブジェクト**: `object`、`config`、`options`など
- **配列**: `items`、`list`、`data`など
- **関数**: `callback`、`handler`、`onSomething`など

## ❌ NG

### ReactNode（children）

```javascript
useEffect(() => {
  console.log(children)
}, [children])
```

```javascript
const memoized = useMemo(() => {
  return children.length
}, [children])
```

### オブジェクト

```javascript
useEffect(() => {
  console.log(object.key)
}, [object])
```

### 配列

```javascript
const memoized = useMemo(() => {
  return items.map(i => i.value)
}, [items])
```

### 関数

```javascript
useEffect(() => {
  callback()
}, [callback])
```

## ✅ OK

### 方法1: refを使用する

DOM要素のrefを通じて子要素にアクセスします（ReactNodeの場合）。

```javascript
const childrenRef = useRef()

useEffect(() => {
  console.log(childrenRef.current)
}, [/* childrenを含めない */])

...

return (
  <Any ref={childrenRef}>{children}</Any>
)
```

### 方法2: MutationObserverを使用する

子要素の変更を検知する必要がある場合は、MutationObserverを使用します。

```javascript
useEffect(() => {
  const observer = new MutationObserver(() => {
    // 子要素の変更を検知
  })

  if (containerRef.current) {
    observer.observe(containerRef.current, { childList: true })
  }

  return () => observer.disconnect()
}, [])
```

### 方法3: useCallbackでラップする

関数の場合は、useCallbackでラップして参照を安定化させます。

```javascript
const stableCallback = useCallback(callback, [/* 必要な依存関係のみ */])

useEffect(() => {
  stableCallback()
}, [stableCallback])
```

### 方法4: プリミティブ値を依存配列に含める

オブジェクトや配列の場合は、必要なプリミティブ値のみを依存配列に含めます。

```javascript
// ❌ オブジェクト全体を依存配列に含める
useEffect(() => {
  console.log(config.apiUrl)
}, [config])

// ✅ 必要な値のみを依存配列に含める
useEffect(() => {
  console.log(config.apiUrl)
}, [config.apiUrl])
```

```javascript
// ❌ 配列全体を依存配列に含める
useEffect(() => {
  console.log(items.length)
}, [items])

// ✅ 必要な値のみを依存配列に含める
useEffect(() => {
  console.log(items.length)
}, [items.length])
```

### 方法5: 依存配列から除外する

本当に必要な値のみを依存配列に含めます。

```javascript
useEffect(() => {
  // 不安定な参照は依存配列に含めない
  console.log(children)
}, [/* 他の依存関係のみ */])
```

## オプション

デフォルトでは `children` のみをチェックしますが、他の変数名も指定できます。

```javascript
{
  "smarthr/best-practice-for-unstable-dependencies": ["error", {
    "unstableNames": ["children", "icon", "prefix", "object", "items", "callback"]
  }]
}
```

## 検出対象のHooks

- `useEffect`
- `useCallback`
- `useMemo`
- `useLayoutEffect`

## 使用例

プロジェクトでよく使われる不安定な参照をすべて指定することで、チーム全体で一貫したコードを書くことができます。

```javascript
{
  "smarthr/best-practice-for-unstable-dependencies": ["error", {
    "unstableNames": [
      // ReactNode
      "children",
      "icon",
      "prefix",
      "suffix",
      // オブジェクト
      "object",
      "config",
      "options",
      "settings",
      // 配列
      "items",
      "list",
      "data",
      "records",
      // 関数
      "callback",
      "handler",
      "onClick",
      "onChange",
      "onSubmit"
    ]
  }]
}
```
