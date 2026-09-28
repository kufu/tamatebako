# smarthr/best-practice-for-optional-chaining

optional chaining（`xxx?.yyy`記法）の適切な使用を促すルールです。

## ルールの目的

このルールは以下の2つの目的を持っています：

1. **optional chainingを使える場所で使う**: if文で存在確認してから実行するパターンは、optional chainingで簡潔に書ける
2. **不要なoptional chainingを削除する**: if文で既に存在チェックしている場合、その中でのoptional chainingは冗長

## チェックする内容

以下のパターンをチェックします:

### パターン1: 単純な存在確認 → 実行

```jsx
// NG: 単純な関数の存在確認 → 実行
if (action) action()

// NG: オブジェクトのメソッドでも同様
if (obj.action) {
  obj.action(hoge, fuga)
}
```

### パターン2: 条件部分が実行部分の先頭にマッチする場合

```jsx
// NG: A.Bのチェック後、A.B.C.d()を実行
if (A.B) {
  A.B.C.d()
}

// NG: obj.hogeのチェック後、obj.hoge.fuga.action()を実行
if (obj.hoge) {
  obj.hoge.fuga.action()
}
```

このパターンでは、条件部分（`A.B`）が実行部分（`A.B.C.d()`）の先頭にマッチするため、`A.B?.C.d()` のようにoptional chainingを使うことができます。

### パターン3: 不要なoptional chainingの削除

```jsx
// NG: 条件文で既に存在チェックしているため、optional chainingは不要
if (action) {
  action?.()
}

// NG: obj.hogeの存在は既にチェック済み
if (obj.hoge) {
  obj.hoge?.fuga.action()
}
```

if文で既に存在をチェックしている場合、その中でoptional chainingを使うのは冗長です。条件文でカバーされている範囲のoptional chainingは削除されます。

ただし、以下の場合は許容されます:

### 他の処理が含まれる場合

```jsx
// OK: if内でreturnなど他の処理がある
if (action) {
  return action()
}
```

### 複数の条件がある場合

```jsx
// OK: 関数の存在チェック以外の条件がある
if (action && any) {
  action()
}
```

### else句がある場合

```jsx
// OK: else句があるため、optional chainingでは表現できない
if (action) {
  action()
} else {
  // ...
}
```

### else if句の場合

```jsx
// OK: else if内なのでoptional chainingでは表現できない
if (any) {
  // ...
} else if (action) {
  action()
}
```

### 無関係な条件の場合

```jsx
// OK: 実行する関数と無関係の条件
if (any) {
  action()
}
```

### 条件でカバーされていない範囲のoptional chaining

```jsx
// OK: actionの存在はチェックしているが、action()の戻り値はチェックしていない
if (action) {
  action()?.bar()
}

// OK: obj.hogeの存在はチェックしているが、fugaの存在はチェックしていない
if (obj.hoge) {
  obj.hoge.fuga?.action()
}
```

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-optional-chaining': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
if (action) action()
```

```jsx
if (obj.action) {
  obj.action(hoge, fuga)
}
```

```jsx
// 条件部分が実行部分の先頭にマッチ
if (A.B) {
  A.B.C.d()
}
```

```jsx
if (obj.hoge) obj.hoge.fuga.action()
```

```jsx
// 不要なoptional chaining
if (action) {
  action?.()
}
```

```jsx
if (obj.hoge) {
  obj.hoge?.fuga.action()
}
```

## ✅ Correct

```jsx
action?.()
```

```jsx
obj.action?.(hoge, fuga)
```

```jsx
// 条件部分の後にoptional chainingを使う
A.B?.C.d()
```

```jsx
obj.hoge?.fuga.action()
```

```jsx
// 不要なoptional chainingを削除
if (action) {
  action()
}
```

```jsx
if (obj.hoge) {
  obj.hoge.fuga.action()
}
```

```jsx
// 実行する関数と無関係の条件の場合は許容
if (any) {
  action()
}
```

```jsx
// 実行する関数の存在チェック以外が条件に含まれている場合は許容
if (action && any) {
  action()
}
```

```jsx
// if - else などifに他条件が連なる場合は許容
if (action) {
  action()
} else {
  ...
}
```

```jsx
// if内で関数呼び出し以外の処理が存在すれば許容
if (action) {
  return action()
}
```

```jsx
// else if内の場合は許容
if (any) {
  ...
} else if (action) {
  action()
}
```

```jsx
// 条件でカバーされていない範囲のoptional chainingは許容
if (action) {
  action()?.bar()
}
```

```jsx
if (obj.hoge) {
  obj.hoge.fuga?.action()
}
```
