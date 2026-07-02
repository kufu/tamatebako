const rule = require('../rules/best-practice-for-reduce-redundant-calls')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

const DETAIL_LINK = `\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-reduce-redundant-calls`

ruleTester.run('best-practice-for-reduce-redundant-calls', rule, {
  valid: [
    // 関数が異なる
    {
      code: `
        if (condition) {
          func(a)
        } else {
          otherFunc(b)
        }
      `,
    },
    // 分岐が1つのみ
    {
      code: `
        if (condition) {
          func(a)
        }
      `,
    },
    // ブロック内に複数のステートメント
    {
      code: `
        if (condition) {
          doSomething()
          func(a)
        } else {
          func(b)
        }
      `,
    },
    // JSX: 子要素あり、属性が異なる
    {
      code: `
        function Component() {
          if (isAdmin) {
            return <UserCard name="Admin" role="admin"><div>Admin</div></UserCard>
          } else {
            return <UserCard name="User" role="user"><div>User</div></UserCard>
          }
        }
      `,
    },
    // JSX: コンポーネントが異なる
    {
      code: `
        function Component() {
          if (condition) {
            return <ComponentA>{children}</ComponentA>
          } else {
            return <ComponentB>{children}</ComponentB>
          }
        }
      `,
    },
    // JSX: spread attributesの内容が異なる
    {
      code: `
        function Component() {
          if (condition) {
            return <Hoge {...propsA}><Fuga></Fuga></Hoge>
          } else {
            return <Hoge {...propsB}><Piyo></Piyo></Hoge>
          }
        }
      `,
    },
    // JSX: spreadがある/ない
    {
      code: `
        function Component() {
          if (condition) {
            return <Hoge name="test"><Fuga></Fuga></Hoge>
          } else {
            return <Hoge {...props}><Piyo></Piyo></Hoge>
          }
        }
      `,
    },
    // JSX: React.Fragment（同じ属性、異なる子要素）
    {
      code: `
        function Component() {
          if (condition) {
            return <React.Fragment><ComponentA /></React.Fragment>
          } else {
            return <React.Fragment><ComponentB /></React.Fragment>
          }
        }
      `,
    },
    // JSX: Fragment（同じ属性、異なる子要素）
    {
      code: `
        function Component() {
          if (condition) {
            return <Fragment><ComponentA /></Fragment>
          } else {
            return <Fragment><ComponentB /></Fragment>
          }
        }
      `,
    },
    // switch: 関数が異なる
    {
      code: `
        switch (role) {
          case 'admin':
            sendAdminNotification(user)
            break
          case 'user':
            sendUserNotification(user)
            break
        }
      `,
    },
    // switch: 複数のステートメント
    {
      code: `
        switch (role) {
          case 'admin':
            console.log('admin')
            sendNotification('admin', user)
            break
          case 'user':
            sendNotification('user', user)
            break
        }
      `,
    },
    // switch: breakがない（意図しないfall-through）
    {
      code: `
        switch (role) {
          case 'admin':
            sendNotification('admin', user)
          case 'user':
            sendNotification('user', user)
            break
        }
      `,
    },
    // switch: caseが1つのみ
    {
      code: `
        function handler() {
          switch (role) {
            case 'admin':
              return sendNotification('admin', user)
          }
        }
      `,
    },
    // switch: defaultなし + switch後に関数が異なる
    {
      code: `
        function handler() {
          switch (role) {
            case 'admin':
              return sendNotification('admin', user)
            case 'user':
              return sendNotification('user', user)
          }
          return sendOtherNotification('guest', user)
        }
      `,
    },
    // switch: defaultなし + switch後にreturnだが値が異なる（文字列）
    {
      code: `
        function handler() {
          switch (status) {
            case 'A':
              return func('a')
            case 'B':
              return func('b')
          }
          return ''
        }
      `,
    },
    // switch: defaultなし + 全caseがreturn + switch後に非return文
    {
      code: `
        function handler() {
          switch (role) {
            case 'admin':
              return notify('admin')
            case 'user':
              return notify('user')
          }
          console.log('No match')
        }
      `,
    },
    // switch: defaultなし + 全caseがreturn + IIFE（後続なし）
    {
      code: `
        const titleMain = (() => {
          switch (dialogType) {
            case MODE.OF_MINE:
              return intl.formatMessage({ id: 'ApplyForMyself' })
            case MODE.OF_OTHERS:
              return intl.formatMessage({ id: 'RequestEmployeeToApply' })
          }
        })()
      `,
    },
    // switch: 波括弧あり + return（defaultなし、後続なし）
    {
      code: `
        function handler() {
          switch (role) {
            case 'admin': {
              return sendNotification('admin', user)
            }
            case 'user': {
              return sendNotification('user', user)
            }
          }
        }
      `,
    },
    // early return: if-else if（最後にreturnなし）+ 次にステートメント
    {
      code: `
        function handler() {
          if (role === 'admin') {
            doAdminAction()
          } else if (role === 'moderator') {
            doModeratorAction()
          }
          return notify('user')
        }
      `,
    },
    // early return: if（returnあり）+ 次のステートメントが非return
    {
      code: `
        function handler() {
          if (role === 'admin') {
            return notify('admin')
          }
          console.log('Not admin')
        }
      `,
    },
    // early return: if-else if（片方のみreturn）+ 次にreturn
    {
      code: `
        function handler() {
          if (role === 'admin') {
            return notify('admin')
          } else if (role === 'moderator') {
            doSomething()
          }
          return notify('user')
        }
      `,
    },
    // early return: if-else if（全branchがreturn）+ IIFE（後続なし）
    {
      code: `
        const result = (() => {
          if (role === 'admin') {
            return notify('admin')
          } else if (role === 'moderator') {
            return notify('moderator')
          }
        })()
      `,
    },
    // メソッドチェーン: 最初のメソッド名が異なる
    {
      code: `
        if (x) {
          api.post('/endpoint').send(data)
        } else {
          api.get('/endpoint').send(data)
        }
      `,
    },
    // メソッドチェーン: 途中の引数が異なる
    {
      code: `
        if (x) {
          api.post('/endpoint1').send(data)
        } else {
          api.post('/endpoint2').send(data)
        }
      `,
    },
    // メソッドチェーン: 最後のメソッド名が異なる
    {
      code: `
        if (x) {
          api.post('/endpoint').send(data)
        } else {
          api.post('/endpoint').execute(data)
        }
      `,
    },
    // メソッドチェーン: チェーンの長さが異なる
    {
      code: `
        if (x) {
          api.post('/endpoint').send(data)
        } else {
          api.post('/endpoint').send(data).then(handleResponse)
        }
      `,
    },
    // メソッドチェーン: 3段階で途中が異なる
    {
      code: `
        if (x) {
          api.post('/endpoint').retry(3).send(data)
        } else {
          api.post('/endpoint').retry(5).send(data)
        }
      `,
    },
    // 三項演算子: 関数が異なる
    {
      code: `
        const result = condition ? funcA(data) : funcB(data)
      `,
    },
    // 三項演算子: 片方が関数呼び出しでない
    {
      code: `
        const result = condition ? func(data) : defaultValue
      `,
    },
    // 三項演算子: ネストで関数が異なる
    {
      code: `
        const result = isAdmin ? notifyAdmin('msg') : isModerator ? notifyModerator('msg') : notifyUser('msg')
      `,
    },
    // 三項演算子: メソッドチェーンで途中が異なる
    {
      code: `
        const result = condition ? api.post('/endpoint1').send(data) : api.post('/endpoint2').send(data)
      `,
    },
    // 三項演算子: JSXでコンポーネントが異なる
    {
      code: `
        const element = condition ? <ComponentA>{child}</ComponentA> : <ComponentB>{child}</ComponentB>
      `,
    },
  ],
  invalid: [
    // ========================================
    // if-else文
    // ========================================
    // 基本的なif-else
    {
      code: `
        if (condition) {
          func(a)
        } else {
          func(b)
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'func', detailLink: DETAIL_LINK },
        },
      ],
    },
    // else if
    {
      code: `
        if (role === 'admin') {
          sendNotification('admin', user)
        } else if (role === 'moderator') {
          sendNotification('moderator', user)
        } else {
          sendNotification('user', user)
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'sendNotification', detailLink: DETAIL_LINK },
        },
      ],
    },
    // 引数の数が異なる
    {
      code: `
        if (condition) {
          func(a, b)
        } else {
          func(c)
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'func', detailLink: DETAIL_LINK },
        },
      ],
    },
    // メソッドチェーン（全体が一致）
    {
      code: `
        if (x) {
          api.post('/endpoint').send(dataA)
        } else {
          api.post('/endpoint').send(dataB)
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'api.post(\'/endpoint\').send', detailLink: DETAIL_LINK },
        },
      ],
    },
    // early returnパターン
    {
      code: `
        function handler() {
          if (role === 'admin') {
            return notify('admin', { priority: 'high' })
          }
          return notify('user', { priority: 'normal' })
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'notify', detailLink: DETAIL_LINK },
        },
      ],
    },
    // early return: if-else if（すべてreturn）+ 次にreturn
    {
      code: `
        function handler() {
          if (role === 'admin') {
            return notify('admin', { priority: 'high' })
          } else if (role === 'moderator') {
            return notify('moderator', { priority: 'medium' })
          }
          return notify('user', { priority: 'low' })
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'notify', detailLink: DETAIL_LINK },
        },
      ],
    },
    // early return: JSX
    {
      code: `
        function Component() {
          if (isAdmin) {
            return <UserCard name="Admin" role="admin" />
          }
          return <UserCard name="User" role="user" />
        }
      `,
      errors: [
        {
          messageId: 'consolidateJSXElement',
          data: { componentName: 'UserCard', detailLink: DETAIL_LINK },
        },
      ],
    },
    // early return: メソッドチェーン
    {
      code: `
        function handler() {
          if (status === 'success') {
            return api.post('/endpoint').send(dataA)
          }
          return api.post('/endpoint').send(dataB)
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'api.post(\'/endpoint\').send', detailLink: DETAIL_LINK },
        },
      ],
    },
    // early return: 複数のif（すべてreturn）+ 次にreturn
    {
      code: `
        function handler() {
          if (role === 'admin') {
            return notify('admin')
          }
          if (role === 'moderator') {
            return notify('moderator')
          }
          return notify('user')
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'notify', detailLink: DETAIL_LINK },
        },
      ],
    },

    // ========================================
    // 三項演算子
    // ========================================
    // 基本的な三項演算子
    {
      code: `
        const result = condition ? func(a) : func(b)
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'func', detailLink: DETAIL_LINK },
        },
      ],
    },
    // ネストした三項演算子（3分岐）
    {
      code: `
        const result = isAdmin ? notify('admin') : isModerator ? notify('moderator') : notify('user')
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'notify', detailLink: DETAIL_LINK },
        },
      ],
    },
    // ネストした三項演算子（4分岐）
    {
      code: `
        const result = a ? func(1) : b ? func(2) : c ? func(3) : func(4)
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'func', detailLink: DETAIL_LINK },
        },
      ],
    },
    // ネストした三項演算子でメソッドチェーン
    {
      code: `
        const result = isAdmin ? api.post('/endpoint').send('admin') : isModerator ? api.post('/endpoint').send('moderator') : api.post('/endpoint').send('user')
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'api.post(\'/endpoint\').send', detailLink: DETAIL_LINK },
        },
      ],
    },
    // ネストした三項演算子でJSX（子要素あり）
    {
      code: `
        const element = isAdmin ? <Layout><Admin /></Layout> : isModerator ? <Layout><Moderator /></Layout> : <Layout><User /></Layout>
      `,
      errors: [
        {
          messageId: 'consolidateJSXElement',
          data: { componentName: 'Layout', detailLink: DETAIL_LINK },
        },
      ],
    },
    // ネストした三項演算子でJSX（子要素なし）
    {
      code: `
        const element = isAdmin ? <UserCard role="admin" /> : isModerator ? <UserCard role="moderator" /> : <UserCard role="user" />
      `,
      errors: [
        {
          messageId: 'consolidateJSXElement',
          data: { componentName: 'UserCard', detailLink: DETAIL_LINK },
        },
      ],
    },

    // ========================================
    // switch文
    // ========================================
    // 基本的なswitch + break
    {
      code: `
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
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'sendNotification', detailLink: DETAIL_LINK },
        },
      ],
    },
    // fall-through（複数のcaseが同じ処理を共有）
    {
      code: `
        switch (role) {
          case 'admin':
          case 'moderator':
            sendNotification('admin', user)
            break
          case 'user':
            sendNotification('user', user)
            break
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'sendNotification', detailLink: DETAIL_LINK },
        },
      ],
    },
    // return文 + defaultあり
    {
      code: `
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
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'formatMessage', detailLink: DETAIL_LINK },
        },
      ],
    },
    // return文 + defaultなし + switch後にreturn
    {
      code: `
        function handler() {
          switch (status) {
            case 'success':
              return formatMessage('success', data)
            case 'error':
              return formatMessage('error', data)
          }
          return formatMessage('unknown', data)
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'formatMessage', detailLink: DETAIL_LINK },
        },
      ],
    },
    // メソッドチェーン
    {
      code: `
        switch (type) {
          case 'A':
            api.post('/endpoint').send(dataA)
            break
          case 'B':
            api.post('/endpoint').send(dataB)
            break
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'api.post(\'/endpoint\').send', detailLink: DETAIL_LINK },
        },
      ],
    },
    // メソッドチェーン: 3段階（if-else）
    {
      code: `
        if (x) {
          api.post('/endpoint').retry(3).send(dataA)
        } else {
          api.post('/endpoint').retry(3).send(dataB)
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'api.post(\'/endpoint\').retry(3).send', detailLink: DETAIL_LINK },
        },
      ],
    },
    // メソッドチェーン: 3段階（switch）
    {
      code: `
        switch (type) {
          case 'A':
            api.post('/endpoint').retry(3).send(dataA)
            break
          case 'B':
            api.post('/endpoint').retry(3).send(dataB)
            break
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'api.post(\'/endpoint\').retry(3).send', detailLink: DETAIL_LINK },
        },
      ],
    },
    // メソッドチェーン: 4段階
    {
      code: `
        if (x) {
          api.post('/endpoint').retry(3).timeout(1000).send(dataA)
        } else {
          api.post('/endpoint').retry(3).timeout(1000).send(dataB)
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'api.post(\'/endpoint\').retry(3).timeout(1000).send', detailLink: DETAIL_LINK },
        },
      ],
    },
    // メソッドチェーン: 三項演算子
    {
      code: `
        const result = condition ? api.post('/endpoint').send(dataA) : api.post('/endpoint').send(dataB)
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'api.post(\'/endpoint\').send', detailLink: DETAIL_LINK },
        },
      ],
    },
    // メソッドチェーン: else if
    {
      code: `
        if (x) {
          api.post('/endpoint').send(dataA)
        } else if (y) {
          api.post('/endpoint').send(dataB)
        } else {
          api.post('/endpoint').send(dataC)
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'api.post(\'/endpoint\').send', detailLink: DETAIL_LINK },
        },
      ],
    },
    // メソッドチェーン: switch fall-through
    {
      code: `
        switch (type) {
          case 'A':
          case 'B':
            api.post('/endpoint').send(dataA)
            break
          case 'C':
            api.post('/endpoint').send(dataC)
            break
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'api.post(\'/endpoint\').send', detailLink: DETAIL_LINK },
        },
      ],
    },
    // switch: case内の複数if + 最後のreturn
    {
      code: `
        function handler() {
          switch (status) {
            case 'A':
              if (condition1) {
                return func('a1')
              }
              if (condition2) {
                return func('a2')
              }
              return func('a3')
          }
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'func', detailLink: DETAIL_LINK },
        },
      ],
    },
    // switch: case内の複数if + 最後のreturn（波括弧あり）
    {
      code: `
        function handler() {
          switch (status) {
            case 'A': {
              if (condition1) {
                return func('a1')
              }
              if (condition2) {
                return func('a2')
              }
              return func('a3')
            }
          }
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'func', detailLink: DETAIL_LINK },
        },
      ],
    },
    // 関数内の複数if + 最後のreturn
    {
      code: `
        function handler() {
          if (condition1) {
            return func('a')
          }
          if (condition2) {
            return func('b')
          }
          return func('c')
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'func', detailLink: DETAIL_LINK },
        },
      ],
    },
    // defaultなし + caseが2つ以上（break使用）
    {
      code: `
        switch (role) {
          case 'admin':
            sendNotification('admin', user)
            break
          case 'user':
            sendNotification('user', user)
            break
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'sendNotification', detailLink: DETAIL_LINK },
        },
      ],
    },
    // switch: 波括弧あり + break
    {
      code: `
        switch (role) {
          case 'admin': {
            sendNotification('admin', user)
            break
          }
          case 'user': {
            sendNotification('user', user)
            break
          }
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'sendNotification', detailLink: DETAIL_LINK },
        },
      ],
    },
    // switch: 波括弧あり + default
    {
      code: `
        switch (role) {
          case 'admin': {
            sendNotification('admin', user)
            break
          }
          default: {
            sendNotification('user', user)
          }
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'sendNotification', detailLink: DETAIL_LINK },
        },
      ],
    },

    // ========================================
    // JSX
    // ========================================
    // JSX: 子要素なし、属性が異なる
    {
      code: `
        function Component() {
          if (isAdmin) {
            return <UserCard name="Admin" role="admin" />
          } else {
            return <UserCard name="User" role="user" />
          }
        }
      `,
      errors: [
        {
          messageId: 'consolidateJSXElement',
          data: { componentName: 'UserCard', detailLink: DETAIL_LINK },
        },
      ],
    },
    // 基本的なJSX（同じコンポーネント、同じ属性、異なる子要素）
    {
      code: `
        function Component() {
          if (isAdmin) {
            return <Hoge name="Admin"><Fuga>{children}</Fuga></Hoge>
          } else {
            return <Hoge name="Admin"><Piyo>{children}</Piyo></Hoge>
          }
        }
      `,
      errors: [
        {
          messageId: 'consolidateJSXElement',
          data: { componentName: 'Hoge', detailLink: DETAIL_LINK },
        },
      ],
    },
    // JSX: 属性なし
    {
      code: `
        function Component() {
          if (condition) {
            return <Wrapper><ChildA /></Wrapper>
          } else {
            return <Wrapper><ChildB /></Wrapper>
          }
        }
      `,
      errors: [
        {
          messageId: 'consolidateJSXElement',
          data: { componentName: 'Wrapper', detailLink: DETAIL_LINK },
        },
      ],
    },
    // JSX: 三項演算子
    {
      code: `
        const element = isAdmin ? <Container size="large"><AdminPanel /></Container> : <Container size="large"><UserPanel /></Container>
      `,
      errors: [
        {
          messageId: 'consolidateJSXElement',
          data: { componentName: 'Container', detailLink: DETAIL_LINK },
        },
      ],
    },
    // JSX: 三項演算子、子要素なし、属性が異なる
    {
      code: `
        const element = isAdmin ? <UserCard name="Admin" role="admin" /> : <UserCard name="User" role="user" />
      `,
      errors: [
        {
          messageId: 'consolidateJSXElement',
          data: { componentName: 'UserCard', detailLink: DETAIL_LINK },
        },
      ],
    },
    // JSX: spread attributesが同じ
    {
      code: `
        function Component() {
          if (condition) {
            return <Hoge {...props}><Fuga></Fuga></Hoge>
          } else {
            return <Hoge {...props}><Piyo></Piyo></Hoge>
          }
        }
      `,
      errors: [
        {
          messageId: 'consolidateJSXElement',
          data: { componentName: 'Hoge', detailLink: DETAIL_LINK },
        },
      ],
    },
    // JSX: spread + 通常の属性が同じ
    {
      code: `
        function Component() {
          if (condition) {
            return <Hoge {...props} name="test"><Fuga></Fuga></Hoge>
          } else {
            return <Hoge {...props} name="test"><Piyo></Piyo></Hoge>
          }
        }
      `,
      errors: [
        {
          messageId: 'consolidateJSXElement',
          data: { componentName: 'Hoge', detailLink: DETAIL_LINK },
        },
      ],
    },
    // JSX: switch + defaultあり
    {
      code: `
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
      `,
      errors: [
        {
          messageId: 'consolidateJSXElement',
          data: { componentName: 'Layout', detailLink: DETAIL_LINK },
        },
      ],
    },
    // JSX: switch + defaultなし + switch後にreturn
    {
      code: `
        function Component() {
          switch (type) {
            case 'admin':
              return <Layout><AdminPanel /></Layout>
            case 'user':
              return <Layout><UserPanel /></Layout>
          }
          return <Layout><GuestPanel /></Layout>
        }
      `,
      errors: [
        {
          messageId: 'consolidateJSXElement',
          data: { componentName: 'Layout', detailLink: DETAIL_LINK },
        },
      ],
    },
    // JSX: switch、子要素なし、属性が異なる
    {
      code: `
        function Component() {
          switch (type) {
            case 'admin':
              return <UserCard name="Admin" role="admin" />
            case 'user':
              return <UserCard name="User" role="user" />
            default:
              return <UserCard name="Guest" role="guest" />
          }
        }
      `,
      errors: [
        {
          messageId: 'consolidateJSXElement',
          data: { componentName: 'UserCard', detailLink: DETAIL_LINK },
        },
      ],
    },
    // switch: case内にconsecutive if + switch後に異なる値を返すreturn
    // case内のconsecutive ifパターンは検出されるべき（hanicaの実際のパターン）
    {
      code: `
        function handler() {
          switch (status) {
            case 'INPUT_REQUESTED':
              return func('a')
            case 'REVIEW_REQUESTED':
              if (condition1) {
                return func('b')
              }
              if (condition2) {
                return func('c')
              }
              return func('d')
          }
          return ''
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'func', detailLink: DETAIL_LINK },
        },
      ],
    },
    // AwaitExpression: if-else early return
    {
      code: `
        async function handler(c, a, b) {
          if (c) return await f(a)
          return await f(b)
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'f', detailLink: DETAIL_LINK },
        },
      ],
    },
    // AwaitExpression: 三項演算子
    {
      code: `
        async function handler(c, a, b) {
          return c ? await f(a) : await f(b)
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'f', detailLink: DETAIL_LINK },
        },
      ],
    },
    // AwaitExpression: switch (default あり)
    {
      code: `
        async function handler(t) {
          switch (t) {
            case 'A': return await f('a')
            case 'B': return await f('b')
            default:  return await f('c')
          }
        }
      `,
      errors: [
        {
          messageId: 'consolidateFunctionCall',
          data: { functionName: 'f', detailLink: DETAIL_LINK },
        },
      ],
    },
  ],
})
