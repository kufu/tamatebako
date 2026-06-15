const rule = require('../rules/best-practice-for-unstable-dependencies')
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

const DETAIL_LINK = `
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-unstable-dependencies`

ruleTester.run('best-practice-for-unstable-dependencies', rule, {
  valid: [
    // 依存配列なし
    {
      code: `
        useEffect(() => {
          console.log('mounted')
        })
      `,
    },
    // 空の依存配列
    {
      code: `
        useEffect(() => {
          console.log('mounted')
        }, [])
      `,
    },
    // childrenを含まない依存配列
    {
      code: `
        useEffect(() => {
          console.log(value)
        }, [value])
      `,
    },
    // useMemo
    {
      code: `
        const memoized = useMemo(() => {
          return value * 2
        }, [value])
      `,
    },
    // useCallback
    {
      code: `
        const handleClick = useCallback(() => {
          console.log('clicked')
        }, [])
      `,
    },
    // useLayoutEffect
    {
      code: `
        useLayoutEffect(() => {
          console.log('layout')
        }, [value])
      `,
    },
    // カスタム設定でiconを指定、childrenは許可
    {
      code: `
        useEffect(() => {
          console.log(children)
        }, [children])
      `,
      options: [{ unstableNames: ['icon'] }],
    },
  ],
  invalid: [
    // useEffect with children
    {
      code: `
        useEffect(() => {
          console.log(children)
        }, [children])
      `,
      errors: [
        {
          messageId: 'unstableDependency',
          data: { name: 'children', detailLink: DETAIL_LINK },
        },
      ],
    },
    // useCallback with children
    {
      code: `
        const handleClick = useCallback(() => {
          console.log(children)
        }, [children])
      `,
      errors: [
        {
          messageId: 'unstableDependency',
          data: { name: 'children', detailLink: DETAIL_LINK },
        },
      ],
    },
    // useMemo with children
    {
      code: `
        const value = useMemo(() => {
          return children.length
        }, [children])
      `,
      errors: [
        {
          messageId: 'unstableDependency',
          data: { name: 'children', detailLink: DETAIL_LINK },
        },
      ],
    },
    // useLayoutEffect with children
    {
      code: `
        useLayoutEffect(() => {
          console.log(children)
        }, [children])
      `,
      errors: [
        {
          messageId: 'unstableDependency',
          data: { name: 'children', detailLink: DETAIL_LINK },
        },
      ],
    },
    // props.children
    {
      code: `
        useEffect(() => {
          console.log(props.children)
        }, [props.children])
      `,
      errors: [
        {
          messageId: 'unstableDependency',
          data: { name: 'children', detailLink: DETAIL_LINK },
        },
      ],
    },
    // 複数の依存関係の中にchildrenがある
    {
      code: `
        useEffect(() => {
          console.log(value, children)
        }, [value, children])
      `,
      errors: [
        {
          messageId: 'unstableDependency',
          data: { name: 'children', detailLink: DETAIL_LINK },
        },
      ],
    },
    // カスタム設定でiconを指定
    {
      code: `
        useEffect(() => {
          console.log(icon)
        }, [icon])
      `,
      options: [{ unstableNames: ['icon'] }],
      errors: [
        {
          messageId: 'unstableDependency',
          data: { name: 'icon', detailLink: DETAIL_LINK },
        },
      ],
    },
    // カスタム設定で複数指定
    {
      code: `
        useEffect(() => {
          console.log(icon, prefix)
        }, [icon, prefix])
      `,
      options: [{ unstableNames: ['icon', 'prefix'] }],
      errors: [
        {
          messageId: 'unstableDependency',
          data: { name: 'icon', detailLink: DETAIL_LINK },
        },
        {
          messageId: 'unstableDependency',
          data: { name: 'prefix', detailLink: DETAIL_LINK },
        },
      ],
    },
    // props.icon
    {
      code: `
        useEffect(() => {
          console.log(props.icon)
        }, [props.icon])
      `,
      options: [{ unstableNames: ['icon'] }],
      errors: [
        {
          messageId: 'unstableDependency',
          data: { name: 'icon', detailLink: DETAIL_LINK },
        },
      ],
    },
    // オブジェクト（object）を検出
    {
      code: `
        useEffect(() => {
          console.log(object.key)
        }, [object])
      `,
      options: [{ unstableNames: ['object'] }],
      errors: [
        {
          messageId: 'unstableDependency',
          data: { name: 'object', detailLink: DETAIL_LINK },
        },
      ],
    },
    // 配列（items）を検出
    {
      code: `
        const memoized = useMemo(() => {
          return items.map(i => i.value)
        }, [items])
      `,
      options: [{ unstableNames: ['items'] }],
      errors: [
        {
          messageId: 'unstableDependency',
          data: { name: 'items', detailLink: DETAIL_LINK },
        },
      ],
    },
    // 関数（callback）を検出
    {
      code: `
        useEffect(() => {
          callback()
        }, [callback])
      `,
      options: [{ unstableNames: ['callback'] }],
      errors: [
        {
          messageId: 'unstableDependency',
          data: { name: 'callback', detailLink: DETAIL_LINK },
        },
      ],
    },
  ],
})
