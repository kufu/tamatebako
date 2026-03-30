# smarthr/best-practice-for-unnesessary-early-return

不必要な早期returnをチェックするルールです。

## なぜ不必要な早期returnを避けるべきなのか

不必要な早期returnとは、**直後に実行される処理の条件を逆転している早期return**を指します。

```jsx
// 不要な早期returnの例
const anyAction = (a) => {
  if (!a) {
    return
  }

  otherAction()
}
```

### 問題点

上記の例では、実質「`otherAction`を実行する条件だけが存在する」ため、コードを読む際に条件を逆転させて考える余計なコストが発生します。

読み手は以下のように考える必要があります:

1. 「`!a`の場合にreturnする」
2. 「ということは、`a`が真の場合に続く処理が実行される」
3. 「つまり、`otherAction()`は`a`が真の場合に実行される」

### 推奨する書き方

```jsx
const anyAction = (a) => {
  if (a) {
    otherAction()
  }
}
```

このように書くことで、本質的に実行したい処理の条件が一目でわかるようになります。

## チェックする内容

基本的に以下の条件**すべて**に合致する場合、NGになります:

1. 早期return以降に`if`や`else`、`switch`、`try`がない
2. 早期returnの条件ブロック以降に変数宣言がない
3. 早期returnの条件ブロック以降に`return`がない
4. 早期returnが値を返していない

### 特殊なパターン1: 早期returnが連続する場合

早期returnが連続している場合、NGになります:

```jsx
// NG: 早期returnが連続している
const anyAction = (a, b) => {
  if (a) return
  if (b) { return }

  const hoge = 'any'
  ...
}
```

これらの早期returnは本質的に一つの条件のため、まとめてください:

```jsx
// OK: 一つの条件にまとめる
const anyAction = (a, b) => {
  if (a || b) return

  const hoge = 'any'
  ...
}
```

上記のように一つの条件にまとめることで:

- 一連の条件であることが明確になる
- よりよい条件がある場合に見つけやすくなる

### 特殊なパターン2: 早期return直後にifが単独で存在する場合

早期return直後に`if`が単独で存在する場合、NGになります:

```jsx
// NG: 早期return直後に単独のifがある
const anyAction = (a, b) => {
  if (a) return

  if (b) {
    ...
  }
}
```

これらの`if`は本質的に一つの条件のため、まとめてください:

```jsx
// OK: 一つの条件にまとめる
const anyAction = (a, b) => {
  if (!a && b) {
    ...
  }
}
```

ただし、以下の場合は許容されます:

#### else句を持つifの場合

```jsx
// OK: else句があるため許容
const anyAction = (a, b) => {
  if (a) return

  if (b) {
    ...
  } else {
    // else ifの場合もNGにならない
    ...
  }
}
```

#### 複数のifが存在する場合

```jsx
// OK: 複数の独立したifがあるため許容
const anyAction = (a, b, c) => {
  if (a) return

  if (b) {
    ...
  }
  if (c) {
    ...
  }
}
```

## 許容される早期returnのパターン

以下のパターンは早期returnが有効なため、許容されます:

### 値を返す早期return

```jsx
const sample1 = (a) => {
  if (a) {
    // 早期returnで値を返しているため許容
    return true
  }
  ...
}
```

### 早期return後に変数宣言がある

```jsx
const sample2 = (a) => {
  if (!a) {
    return
  }

  // 早期return後に変数宣言しているため許容
  const calculated = calc(a)
  ...
}
```

### else句がある

```jsx
const sample3 = (a) => {
  if (!a) {
    return
  }
  // 早期returnの条件以外に条件が存在するため許容
  else if (a === any) {
    ...
  }
}
```

### 早期returnの間に処理がある

```jsx
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
```

### 関数スコープのrootに別のreturnがある

```jsx
const sample5 = (a, b) => {
  if (!a) {
    return
  }

  // 早期returnとは別のreturnが関数スコープのrootにあるため許容
  return ...
}
```

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

```jsx
// 早期returnに分ける必要がないifなのでNG
const anyAction = (a, b) => {
  if (!a) {
    return
  }
  if (b) {
    anyAction()
  }
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

```jsx
const anyAction = (a, b) => {
  if (a) {
    return
  }

  // 早期return以降で複数の条件分岐がある場合も許容
  if (b) {
    bAction()
  }
  if (c) {
    cAction()
  }
}
```
