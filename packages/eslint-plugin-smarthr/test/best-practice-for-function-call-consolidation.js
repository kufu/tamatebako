const rule = require('../rules/best-practice-for-function-call-consolidation')
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

const DETAIL_LINK = `\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-function-call-consolidation`

ruleTester.run('best-practice-for-function-call-consolidation', rule, {
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
  ],
})
