# best-practice-for-reduce-redundant-calls

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

### パターン2-2: 連続するif文（すべてreturnで終わる）+ 最後のreturn

関数やcaseブロック内で、連続する複数のif文（すべて`else`なし、`return`で終わる）+ 最後の`return`文がある場合も検出されます。

```javascript
// 関数内の連続するif文
function handler() {
  if (condition1) {
    return func('a')
  }
  if (condition2) {
    return func('b')
  }
  return func('c')
}

// switch case内の連続するif文
switch (status) {
  case 'ACTIVE':
    if (user.isAdmin) {
      return intl.formatMessage({ id: 'AdminMessage' })
    }
    if (user.isModerator) {
      return intl.formatMessage({ id: 'ModeratorMessage' })
    }
    return intl.formatMessage({ id: 'UserMessage' })
}

// case内に波括弧がある場合も同様
switch (status) {
  case 'ACTIVE': {
    if (user.isAdmin) {
      return intl.formatMessage({ id: 'AdminMessage' })
    }
    if (user.isModerator) {
      return intl.formatMessage({ id: 'ModeratorMessage' })
    }
    return intl.formatMessage({ id: 'UserMessage' })
  }
}
```

### パターン3: 三項演算子

```javascript
// 基本的な三項演算子
const result = condition ? func(a) : func(b)

// ネストした三項演算子
const result = isAdmin ? notify('admin') : isModerator ? notify('moderator') : notify('user')
```

### パターン4: JSX/TSX

**子要素なし（セルフクロージングタグ）の場合:**
同じコンポーネント名で、属性の差分が**1つだけ**の場合に検出されます。

```jsx
// 属性の差分が1つ（role のみ異なる）→ 検出される
function Component() {
  if (isModerator) {
    return <UserCard role="moderator" />
  } else {
    return <UserCard role="user" />
  }
}

// 属性の差分が1つ（role のみ異なる、他は同じ）→ 検出される
function Component({ data }) {
  if (isModerator) {
    return <UserCard role="moderator" hoge={data} />
  } else {
    return <UserCard role="user" hoge={data} />
  }
}

// boolean属性の差分が1つ → 検出される
function Component() {
  if (condition) {
    return <Component hoge={true} fuga={false} />
  } else {
    return <Component hoge={true} fuga={false} piyo />
  }
}

// 三項演算子
const element = isModerator
  ? <UserCard role="moderator" hoge={data} />
  : <UserCard role="user" hoge={data} />
```

**子要素あり の場合:**
同じコンポーネント名、同じ属性で、子要素が異なる場合に検出されます。

```jsx
// 同じコンポーネント、同じ属性、異なる子要素
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

// spread attributes
function Component() {
  if (condition) {
    return <Hoge {...props}><Fuga></Fuga></Hoge>
  } else {
    return <Hoge {...props}><Piyo></Piyo></Hoge>
  }
}

// spread + 通常の属性
function Component() {
  if (condition) {
    return <Hoge {...props} name="test"><Fuga></Fuga></Hoge>
  } else {
    return <Hoge {...props} name="test"><Piyo></Piyo></Hoge>
  }
}
```

### パターン5: switch文

```javascript
// 基本的なswitch + break
switch (role) {
  case 'admin':
    sendNotification('admin', user)
    break
  case 'moderator':
    sendNotification('moderator', user)
    break
  default:
    sendNotification('user', user)
}

// fall-through（複数のcaseが同じ処理を共有）
switch (role) {
  case 'admin':
  case 'moderator':
    sendNotification('admin', user)
    break
  case 'user':
    sendNotification('user', user)
    break
}

// return文 + defaultあり
function handler() {
  switch (status) {
    case 'success':
      return formatMessage('success', data)
    case 'error':
      return formatMessage('error', data)
    default:
      return formatMessage('unknown', data)
  }
}

// return文 + defaultなし + switch後にreturn
function handler() {
  switch (status) {
    case 'success':
      return formatMessage('success', data)
    case 'error':
      return formatMessage('error', data)
  }
  return formatMessage('unknown', data)
}

// JSX
function Component() {
  switch (type) {
    case 'admin':
      return <Layout><AdminPanel /></Layout>
    case 'user':
      return <Layout><UserPanel /></Layout>
    default:
      return <Layout><GuestPanel /></Layout>
  }
}
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

### JSX: 子要素なし、属性の差分が2つ以上の場合

```jsx
// 属性の差分が2つ以上（name と role が異なる）→ 意図的に分けていると判断
function Component() {
  if (isAdmin) {
    return <UserCard name="Admin" role="admin" />
  } else {
    return <UserCard name="User" role="user" />
  }
}

// FormattedMessage（id と defaultMessage が異なる = 差分2つ）
function Component({ searchKeyword }) {
  return searchKeyword === '' ? (
    <FormattedMessage id="userRoles/addDialog/noUser" defaultMessage="追加できるアカウントがありません" />
  ) : (
    <FormattedMessage id="userRoles/addDialog/noResult" defaultMessage="該当するアカウントがありません" />
  )
}
```

### JSX: 子要素あり、属性が異なる場合

```jsx
// 子要素がある場合、属性が異なれば許容される
if (isAdmin) {
  return <UserCard name="Admin" role="admin"><div>Admin</div></UserCard>
} else {
  return <UserCard name="User" role="user"><div>User</div></UserCard>
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

### JSX: spread attributesの内容が異なる場合

```jsx
// spreadの変数が異なるため、許容される
if (condition) {
  return <Hoge {...propsA}><Fuga></Fuga></Hoge>
} else {
  return <Hoge {...propsB}><Piyo></Piyo></Hoge>
}
```

### JSX: spreadがある/ない場合

```jsx
// 属性の形式が異なるため、許容される
if (condition) {
  return <Hoge name="test"><Fuga></Fuga></Hoge>
} else {
  return <Hoge {...props}><Piyo></Piyo></Hoge>
}
```

### JSX: React.FragmentまたはFragmentの場合

```jsx
// React.FragmentとFragmentは除外される
if (condition) {
  return <React.Fragment><ComponentA /></React.Fragment>
} else {
  return <React.Fragment><ComponentB /></React.Fragment>
}

// Fragmentも同様
if (condition) {
  return <Fragment><ComponentA /></Fragment>
} else {
  return <Fragment><ComponentB /></Fragment>
}
```

### switch: 関数が異なる場合

```javascript
switch (role) {
  case 'admin':
    sendAdminNotification(user)
    break
  case 'user':
    sendUserNotification(user)
    break
}
```

### switch: 複数のステートメントがある場合

```javascript
switch (role) {
  case 'admin':
    console.log('admin')
    sendNotification('admin', user)
    break
  case 'user':
    sendNotification('user', user)
    break
}
```

### switch: breakがない場合（意図しないfall-through）

```javascript
switch (role) {
  case 'admin':
    sendNotification('admin', user)
    // break忘れ → 次のcaseの処理も実行される（複数ステートメント扱い）
  case 'user':
    sendNotification('user', user)
    break
}
```

### switch: caseが1つのみの場合

```javascript
function handler() {
  switch (role) {
    case 'admin':
      return sendNotification('admin', user)
  }
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

**switch文の場合も同様:**

```javascript
// Before
switch (role) {
  case 'admin':
    sendNotification('admin', user)
    break
  case 'moderator':
    sendNotification('moderator', user)
    break
  default:
    sendNotification('user', user)
}

// After（方法2と同じ）
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
- **JSXの検出条件:**
  - **子要素なし（self-closing）の場合:** 同じコンポーネント名で、属性の差分が1つだけの場合に検出します。差分が2つ以上の場合は、意図的に分けていると判断して検出しません。
  - **子要素ありの場合:** 同じコンポーネント名、同じ属性（値を含む）で、子要素が異なる場合に検出します。
  - **React.FragmentとFragmentは除外されます。** これらは単なるグループ化のためのものなので、検出対象外です。
- JSXのspread attributes（`{...props}`）がある場合は、完全一致のみ検出します。spreadの変数名が異なる場合（`{...propsA}` vs `{...propsB}`）や、片方だけspreadがある場合は検出されません。
- **if文/switch文のearly returnパターン:** すべてのブランチが`return`で終わっている場合のみ、次のステートメントも検出対象に含まれます。`break`を使う場合は含まれません。
- **switch文のfall-through:** 空のcaseは次のcaseにfall-throughし、最初に見つかった処理を実行するものとして扱います。
- **switch文のdefaultケース:** defaultケースは最後のcaseなので、breakがなくても許容されます。
