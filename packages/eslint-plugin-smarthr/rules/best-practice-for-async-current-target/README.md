# smarthr/best-practice-for-async-current-target

jsで発生したイベントのcurrentTargetは状況によって値が空になる場合があるため、参照するタイミングをチェックするルールです


## currentTargetが空になる状況とは

currentTarget属性はイベントの実行中のみ参照可能な値であり、それ以外のタイミングで参照するとエラーになる可能性があります。<br />
詳細: [https://developer.mozilla.org/ja/docs/Web/API/Event/currentTarget](https://developer.mozilla.org/ja/docs/Web/API/Event/currentTarget)

```jsx
// async-awaitにより、イベント処理中ではなくなっているため、currentTargetがnullの可能性がある
const onChange = async (e) => {
  await anyAction()

  const value = e.currentTarget.value
  ...
}
```

この問題はイベントハンドラ内でcurrentTargetを参照する際、現在のイベントハンドラーが実行されているスレッドと別スレッドで実行された場合発生する可能性があります。<br />
そのためasync-await以外の状況でも発生する可能性があります。

```jsx
// setItemはReactのuseStateのset関数
// useStateのset関数の引数を関数にした場合、非同期で呼び出されるためcurrentTargetがnullの可能性がある
const onSelect = (e) => {
  setItem((item) => ({ ...item, value : e.currentTarget.value }))
}
```

モダンブラウザではイベントの実行終了後もキャッシュされている場合がありますが、それもいずれ消えるためrandom failの原因になります。<br />
以上からイベントハンドラーの先頭でcurrentTarget関連の参照を変数に格納することを推奨します。

```jsx
const onChange = async (e) => {
  const cachedEvent = e.currentTarget

  await anyAction()
  ...

  // cachedEventの参照は残り続けるためOK
  const value = cachedEvent.value

  ...
}
```

### このルールがエラーになる条件について

上記で説明した通りイベントハンドラ内でcurrentTargetを参照する際、現在のイベントハンドラーが実行されているスレッドと別スレッドでされた場合にエラーになります。<br />
別スレッドに分かれる際によくあるパターンは以下の通りです。

- async - await が利用されている関数でawait以降でe.currentTargetを参照する場合
- イベントハンドラ内で別関数を使っており、その内部からe.currentTargetを参照する場合
  - setTimeout, setInternal, requestAnimationFrameなどを利用する場合もこれにあたります
  - 前述のReactのuseStateのsetter以外にも別関数にcallbackとして渡した場合、非同期で実行される可能性があり危険です

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
