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
    // JSX: 属性が異なる
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
    // ネストした三項演算子
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

    // ========================================
    // JSX
    // ========================================
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
  ],
})
