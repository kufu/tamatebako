# smarthr/best-practice-for-unnesessary-early-return

- 不必要な早期returnをチェックするルールです
- 不要な早期returnとは **直後に実行される処理の条件を逆転している早期return** を指します

```jsx
// 不要な早期returnの例
const anyAction = (a) => {
  if (!a) {
    return
  }

  otherAction()
}
```

- 上記の例の場合、実質 `otherActionを実行する条件だけが存在する` ため、実際にコードを読む際、条件を逆転させて考える余計なコストが発生します
- 下記の様に早期returnを利用せず書くことを推奨します


```jsx
const anyAction = (a) => {
  if (a) {
    otherAction()
  }
}
```

- 上記のような条件に修正することで、本質的に実行したい処理の条件がわかりやすくなります
- このルールは以下の条件すべてに合致する場合、NGにします
  - 早期return以降にifやelse、switch, tryがない
  - 早期returnの条件ブロック以降に変数宣言がない
  - 早期returnの条件ブロック以降にreturnがない
  - 早期returnが値を返していない

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-unnesessary-early-return': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
const anyAction = (a) => {
  // otherActionの実行条件を逆転させているだけのためNG
  if (!a) {
    return
  }

  otherAction()
}
```

```jsx
const anyAction = (a, b) => {
  // 早期returnの条件内容自体は無関係にチェックするためNG
  if (!a || !b) {
    return
  }

  otherAction()
}
```

```jsx
const anyAction = (a, b) => {
  switch (a) {
    ...
  }

  // 早期returnより前に条件などがあっても、条件が実質逆転しているためNG
  if (!b) {
    return
  }

  otherAction()
}
```

```jsx
const anyAction = (a, b) => {
  if (!a) {
    return
  }
  // 早期returnが分割されているため、前述の早期returnの条件とまとめるべきなのでNG
  if (!b) {
    return
  }

  otherAction()
}
```

## ✅ Correct

```jsx
const anyAction = (a) => {
  if (a) {
    otherAction()
  }
}
```

```jsx
// 許容する早期returnの例
const sample1 = (a) => {
  if (a) {
    // 早期returnで値を返しているため許容
    return true
  }
  ...
}

const sample2 = (a) => {
  if (!a) {
    return
  }

  // 早期return後に変数宣言しているため許容
  const caculated = calc(a)
  ...
}

const sample3 = (a) => {
  if (!a) {
    return
  }
  // 早期returnの条件以外に条件が存在するため許容
  else if (a === any) {
    ...
  }
}

const sample4 = (a, b) => {
  if (!a) {
    return
  }

  otherAction1(a)

  // この場合も別条件のため許容
  if (b === any) {
    return
  }
  ...
}

const sample5 = (a, b) => {
  if (!a) {
    return
  }

  // 早期returnとは別のreturnが関数スコープのrootにあるため許容
  return ...
}
```
