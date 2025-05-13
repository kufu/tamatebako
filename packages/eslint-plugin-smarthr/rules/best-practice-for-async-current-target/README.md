# smarthr/best-practice-for-async-current-target

- jsのイベントのcurrentTargetの参照するタイミングをチェックするルールです
- currentTarget属性はイベントの実行中のみ参照可能な値であり、それ以外のタイミングで参照するとエラーになる可能性があります
  - https://developer.mozilla.org/ja/docs/Web/API/Event/currentTarget
- イベントハンドラーの先頭でcurrentTarget関連の参照を変数に格納することを推奨します


## rules

```js
{
  rules: {
    'smarthr/best-practice-for-async-current-target': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
// async-awaitにより、イベント処理中ではなくなっているため、currentTargetがnullの可能性がある
const onChange = async (e) => {
  await anyAction()

  const value = e.currentTarget.value
  ...
}
```

```jsx
// setItemはReactのuseStateのset関数
// useStateのset関数は非同期のためcurrentTargetがnullの可能性がある
const onSelect = (e) => {
  setItem((item) => ({ ...item, value : e.currentTarget.value }))
}
```

```jsx
// 処理が非同期の可能性はあるため、イベントハンドラ用関数のスコープ直下以外から参照する場合はエラーになります
const onInput = (e) => {
  anyAction(() => {
    const currentTarget = e.currentTarget
    ...
  })
}
```

## ✅ Correct

```jsx
const onChange = async (e) => {
  const value = e.currentTarget.value

  await anyAction()
  ...
}
```

```jsx
const onSelect = (e) => {
  const value = e.currentTarget.value

  setItem((item) => ({ ...item, value }))
}
```

```jsx
const onInput = (e) => {
  const currentTarget = e.currentTarget

  anyAction(() => {
    const value = currentTarget.value
    ...
  })
}
```
