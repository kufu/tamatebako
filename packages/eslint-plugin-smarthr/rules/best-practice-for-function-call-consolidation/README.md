# best-practice-for-function-call-consolidation

すべての分岐で同じ関数を呼び出している場合、引数のみを条件分岐にすることを推奨します。

**このルールは検出のみで、自動修正は提供しません。** 修正方法は状況により異なるため、手動で対応してください。

## ❌ Invalid

### パターン1: if-else文で同じ関数を呼び出す

```javascript
// 基本的なif-else
if (condition) {
  func(a)
} else {
  func(b)
}

// else ifも検出対象
if (role === 'admin') {
  sendNotification('admin', user)
} else if (role === 'moderator') {
  sendNotification('moderator', user)
} else {
  sendNotification('user', user)
}

// 引数の数が異なる場合も検出
if (condition) {
  func(a, b)
} else {
  func(c)
}

// メソッドチェーン全体が一致する場合
if (x) {
  api.post('/endpoint').send(dataA)
} else {
  api.post('/endpoint').send(dataB)
}
```

### パターン2: early returnパターン

```javascript
function handler() {
  if (role === 'admin') {
    return notify('admin', { priority: 'high' })
  }
  return notify('user', { priority: 'normal' })
}
```

### パターン3: 三項演算子

```javascript
// 基本的な三項演算子
const result = condition ? func(a) : func(b)

// ネストした三項演算子
const result = isAdmin ? notify('admin') : isModerator ? notify('moderator') : notify('user')
```

### パターン4: JSX/TSX（同じコンポーネント、同じ属性、異なる子要素）

```jsx
// if-else
function Component() {
  if (isAdmin) {
    return <Hoge name="Admin"><Fuga>{children}</Fuga></Hoge>
  } else {
    return <Hoge name="Admin"><Piyo>{children}</Piyo></Hoge>
  }
}

// 三項演算子
const element = isAdmin
  ? <Container size="large"><AdminPanel /></Container>
  : <Container size="large"><UserPanel /></Container>
```

## ✅ Valid

### 関数が異なる場合

```javascript
if (condition) {
  func(a)
} else {
  otherFunc(b)
}
```

### 分岐が1つのみの場合

```javascript
if (condition) {
  func(a)
}
```

### ブロック内に複数のステートメントがある場合

```javascript
if (condition) {
  doSomething()
  func(a)
} else {
  func(b)
}
```

### JSX: 属性が異なる場合

```jsx
// UserCardコンポーネントの属性が異なるため、許容される
if (isAdmin) {
  return <UserCard name="Admin" role="admin" />
} else {
  return <UserCard name="User" role="user" />
}
```

### JSX: コンポーネントが異なる場合

```jsx
if (condition) {
  return <ComponentA>{children}</ComponentA>
} else {
  return <ComponentB>{children}</ComponentB>
}
```

## 修正方法

このルールは様々なパターンがあるため、自動修正は提供していません。以下の方法を検討してください。

### 方法1: 引数を条件分岐にする

```javascript
// Before
if (condition) {
  func(a)
} else {
  func(b)
}

// After
func(condition ? a : b)
```

### 方法2: オブジェクトを使う

```javascript
// Before
if (role === 'admin') {
  sendNotification('admin', user)
} else if (role === 'moderator') {
  sendNotification('moderator', user)
} else {
  sendNotification('user', user)
}

// After
const roleMap = {
  admin: 'admin',
  moderator: 'moderator',
  user: 'user',
}
sendNotification(roleMap[role] || 'user', user)
```

### 方法3: JSXの子要素を条件分岐にする

```jsx
// Before
if (isAdmin) {
  return <Hoge name="Admin"><Fuga>{children}</Fuga></Hoge>
} else {
  return <Hoge name="Admin"><Piyo>{children}</Piyo></Hoge>
}

// After
return (
  <Hoge name="Admin">
    {isAdmin ? <Fuga>{children}</Fuga> : <Piyo>{children}</Piyo>}
  </Hoge>
)
```

## 注意点

- メソッドチェーンは完全一致で検出します。例えば、`api.post('/endpoint1').send(dataA)` と `api.post('/endpoint2').send(dataB)` は検出されません（エンドポイントが異なるため）。
- JSXの場合、コンポーネント名と属性（値を含む）が完全に一致する場合のみ検出します。子要素の違いは検出対象です。
