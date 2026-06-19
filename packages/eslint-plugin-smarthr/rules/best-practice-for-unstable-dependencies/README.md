# best-practice-for-unstable-dependencies

React Hooksの依存配列に不安定な参照（オブジェクト、配列、関数、ReactNodeなど）を含めることを禁止します。

これらの値は参照が頻繁に変わるため、依存配列に含めると不要な再実行や無限ループの原因となります。

**デフォルトでは `children` のみを検出します。**他の変数名を検出したい場合は、オプションで追加してください。

## 不安定な参照の種類（オプションで追加可能）

- **ReactNode**: `children`（デフォルト）、`icon`、`prefix`、`suffix`など
- **オブジェクト**: `object`、`config`、`options`、`settings`など
- **配列**: `items`、`list`、`data`、`records`など
- **関数**: `callback`、`handler`、`onClick`、`onChange`、`onSubmit`など

## ❌ NG

### children（デフォルトで検出）

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

### オプション追加時の例

以下は `additionalUnstableNames` オプションで変数名を追加した場合の検出例です。

**オブジェクト:**

```javascript
// additionalUnstableNames: ["object"] を設定した場合
useEffect(() => {
  console.log(object.key)
}, [object])
```

**配列:**

```javascript
// additionalUnstableNames: ["items"] を設定した場合
const memoized = useMemo(() => {
  return items.map(i => i.value)
}, [items])
```

**関数:**

```javascript
// additionalUnstableNames: ["callback"] を設定した場合
useEffect(() => {
  callback()
}, [callback])
```

## ✅ OK

### 方法1: refを使用する（最も推奨）

依存配列で再実行する必要がない変数は、refに保存して依存配列から除外します。

**children（DOM要素のrefを使う場合）:**

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

refは任意の値を保持でき、更新してもコンポーネントの再レンダリングをトリガーしません。

```javascript
const valueRef = useRef()
valueRef.current = value  // レンダリングごとに最新の値に更新

useEffect(() => {
  // valueRef.currentを使用
  console.log(valueRef.current)
}, [/* valueを含めない */])
```

### 方法2: MutationObserverを使用する

`children` の変更を検知する必要がある場合は、DOM要素にrefを設定してMutationObserverで監視します。

```javascript
const containerRef = useRef()

useEffect(() => {
  const observer = new MutationObserver(() => {
    // children内のDOM要素が追加/削除されたときの処理
    console.log('子要素が変更されました')
  })

  if (containerRef.current) {
    // containerRef内の子要素の変更を監視
    observer.observe(containerRef.current, {
      childList: true,      // 直接の子要素の追加/削除を監視
      subtree: true,        // 子孫要素の変更も監視（必要に応じて）
    })
  }

  return () => observer.disconnect()
}, [])  // childrenは依存配列に含めない

...

return (
  <div ref={containerRef}>
    {children}
  </div>
)
```

### 方法3: プリミティブ値のみを依存配列に含める

オブジェクトや配列の場合は、必要なプリミティブ値のみを依存配列に含めます。

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

**スプレッド構文を使っている場合:**

スプレッド構文（`...config`など）で展開している箇所は、実際に必要な値のみをベタ書きできないか検証してください。

```javascript
// ❌ オブジェクト全体を展開
useEffect(() => {
  const newConfig = { ...config, newProp: value }
  doSomething(newConfig)
}, [config, value])

// ✅ 必要な値のみをベタ書き
useEffect(() => {
  const newConfig = {
    apiUrl: config.apiUrl,
    timeout: config.timeout,
    newProp: value
  }
  doSomething(newConfig)
}, [config.apiUrl, config.timeout, value])
```

**ヒント:** 多くの場合、スプレッド構文で展開しているオブジェクトは、実際には一部のプロパティしか使っていないことがあります。使用箇所を確認して、必要な値のみを明示的に指定することで、依存配列を最小限に抑えられます。配列の場合も、実際に必要なのは`length`や特定のインデックスの値だけかもしれません。

### 方法4: useCallbackやuseMemoでメモ化する

不安定な参照を安定化させるために、useCallbackやuseMemoでラップします。

**関数の場合（useCallback）:**

```javascript
// ❌ 関数を直接依存配列に含める
useEffect(() => {
  callback()
}, [callback])

// ✅ useCallbackでメモ化
const memoizedCallback = useCallback(callback, [/* callbackの依存関係 */])

useEffect(() => {
  memoizedCallback()
}, [memoizedCallback])
```

**オブジェクトの場合（useMemo）:**

```javascript
// ❌ オブジェクトを直接依存配列に含める
useEffect(() => {
  console.log(config.apiUrl)
}, [config])

// ✅ useMemoでメモ化
const memoizedConfig = useMemo(() => config, [/* configの依存関係 */])

useEffect(() => {
  console.log(memoizedConfig.apiUrl)
}, [memoizedConfig])
```

**注意:** メモ化は依存関係が明確な場合に有効です。依存関係が不明確な場合は、方法1のrefを使用することを推奨します。

### 方法5: イベントオブジェクトから値を取得する（useCallbackの場合）

useCallbackでイベントハンドラーを定義する場合、値を依存配列に含めずに、イベントオブジェクトから取得できます。

**button要素の`value`属性を使う:**

```javascript
// ❌ 値を依存配列に含める
const handleClick = useCallback(() => {
  doSomething(itemId)
}, [itemId])  // itemIdが変わるたびにコールバックが再生成される

<button onClick={handleClick}>削除</button>
```

```javascript
// ✅ イベントから値を取得
const handleClick = useCallback((e) => {
  const itemId = e.currentTarget.value
  doSomething(itemId)
}, [])  // 依存配列が空になり、コールバックが安定する

<button value={itemId} onClick={handleClick}>削除</button>
```

**data-*属性も同様に使える:**

```javascript
const handleClick = useCallback((e) => {
  const itemId = e.currentTarget.getAttribute('data-id')
  const itemType = e.currentTarget.getAttribute('data-type')
  doSomething(itemId, itemType)
}, [])

<button
  data-id={itemId}
  data-type={itemType}
  onClick={handleClick}
>
  削除
</button>
```

**メリット:**
- 依存配列が空になり、コールバックが安定する
- コンポーネントの再レンダリングが減る
- リスト内の各アイテムで異なるコールバック関数を生成する必要がない

**注意:**
- この方法はイベントハンドラー（onClick、onChange等）でのみ使用できます。useEffect内など、イベントオブジェクトがない場合は他の方法を使用してください。
- `value`属性や`getAttribute()`で取得した値は**文字列**になります。数値や真偽値が必要な場合は適切に変換してください（例: `Number(e.currentTarget.value)`、`e.currentTarget.value === 'true'`）。

## オプション

### additionalUnstableNames

デフォルトでは `children` のみをチェックしますが、他の変数名を追加できます。

```javascript
{
  "smarthr/best-practice-for-unstable-dependencies": ["error", {
    "additionalUnstableNames": ["icon", "prefix", "object", "items", "callback"]
  }]
}
```

### additionalTargetHooks

デフォルトでは `useEffect`, `useLayoutEffect`, `useCallback`, `useMemo` をチェックしますが、カスタムフックを追加できます。

```javascript
{
  "smarthr/best-practice-for-unstable-dependencies": ["error", {
    "additionalTargetHooks": ["useCustomHook", "useMyEffect"]
  }]
}
```

## 検出対象のHooks（デフォルト）

- `useEffect`
- `useCallback`
- `useMemo`
- `useLayoutEffect`

## 使用例

### 不安定な参照の追加

プロジェクトでよく使われる不安定な参照を追加することで、チーム全体で一貫したコードを書くことができます。

```javascript
{
  "smarthr/best-practice-for-unstable-dependencies": ["error", {
    "additionalUnstableNames": [
      // ReactNode
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

### カスタムフックの追加

プロジェクト固有のカスタムフックも検出対象に追加できます。

```javascript
{
  "smarthr/best-practice-for-unstable-dependencies": ["error", {
    "additionalUnstableNames": ["icon", "items"],
    "additionalTargetHooks": ["useCustomEffect", "useMyMemo"]
  }]
}
```
