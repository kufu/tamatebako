/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */

// smarthr-uiコンポーネントのデフォルト値定義
const DEFAULT_PROPS = {
  Stack: {
    inline: false,
    gap: 1,
  },
  Cluster: {
    inline: false,
    gap: 0.5,
  },
  Reel: {
    gap: 0.5,
    padding: 0,
  },
  Sidebar: {
    align: 'stretch',
    contentsMinWidth: '50%',
    gap: 1,
    right: false,
  },
  Heading: {
    type: 'sectionTitle',
  },
  Button: {
    type: 'button',
    size: 'M',
    wide: false,
    variant: 'secondary',
    loading: false,
  },
}

const SCHEMA = [
  {
    type: 'object',
    properties: {
      defaultProps: {
        type: 'object',
        description: 'コンポーネントのデフォルト値を追加・上書き',
        additionalProperties: {
          type: 'object',
          additionalProperties: true,
        },
      },
    },
    additionalProperties: false,
  },
]

/**
 * 2つの値が等しいかチェック
 * @param {*} value1
 * @param {*} value2
 * @returns {boolean}
 */
const isEqual = (value1, value2) => {
  const type1 = typeof value1
  const type2 = typeof value2

  // 型が異なる場合、数値と文字列の相互変換のみ許容
  if (type1 !== type2) {
    if ((type1 === 'number' && type2 === 'string') || (type1 === 'string' && type2 === 'number')) {
      return Number(value1) === Number(value2)
    }
    return false
  }

  // 型が同じ場合は直接比較
  return value1 === value2
}

/**
 * JSXAttributeの値を取得
 * @param {import('@typescript-eslint/utils').TSESTree.JSXAttribute} attribute
 * @returns {*}
 */
const getAttributeValue = (attribute) => {
  // <Component prop /> の形式はtrueとみなす
  if (!attribute.value) {
    return true
  }

  const { value } = attribute

  switch (value.type) {
    case 'Literal':
      return value.value

    case 'JSXExpressionContainer': {
      const { expression } = value

      switch (expression.type) {
        case 'Literal':
          return expression.value

        case 'Identifier':
          // true/falseのIdentifier
          if (expression.name === 'true') return true
          if (expression.name === 'false') return false
          return undefined

        case 'UnaryExpression':
          // 負の数値（例: gap={-1}）
          if (expression.operator === '-' && expression.argument.type === 'Literal') {
            return -expression.argument.value
          }
          return undefined

        default:
          return undefined
      }
    }

    default:
      return undefined
  }
}

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: SCHEMA,
  },
  create(context) {
    const options = context.options[0] || {}
    const userDefaultProps = options.defaultProps || {}

    // デフォルト値とユーザー定義をマージ
    const mergedDefaultProps = { ...DEFAULT_PROPS }
    for (const [componentName, props] of Object.entries(userDefaultProps)) {
      mergedDefaultProps[componentName] = {
        ...(mergedDefaultProps[componentName] || {}),
        ...props,
      }
    }

    return {
      JSXOpeningElement(node) {
        // コンポーネント名を取得（JSXIdentifierのみ対応）
        if (node.name.type !== 'JSXIdentifier') {
          return
        }

        const componentName = node.name.name
        const defaultProps = mergedDefaultProps[componentName]

        // このコンポーネントのデフォルト値定義がない場合はスキップ
        if (!defaultProps) {
          return
        }

        // 各attributeをチェック
        for (const attribute of node.attributes) {
          // JSXAttribute以外（spreadなど）はスキップ
          if (attribute.type !== 'JSXAttribute' || typeof attribute.name.name !== 'string') {
            continue
          }

          const propName = attribute.name.name
          const defaultValue = defaultProps[propName]

          // このpropにデフォルト値が定義されていない場合はスキップ
          if (defaultValue === undefined) {
            continue
          }

          const actualValue = getAttributeValue(attribute)

          // デフォルト値と実際の値が一致する場合、エラー報告
          if (actualValue !== undefined && isEqual(actualValue, defaultValue)) {
            const formattedDefaultValue = JSON.stringify(defaultValue)

            context.report({
              node: attribute,
              message: `prop "${propName}" はデフォルト値と同じため不要です
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-default-props
 - デフォルト値: ${formattedDefaultValue}
 - コンポーネント: ${componentName}
 - このpropは省略できます（デフォルト値が自動的に適用されます）`,
              fix(fixer) {
                const sourceCode = context.sourceCode || context.getSourceCode()
                let start = attribute.range[0]
                let end = attribute.range[1]

                // 属性の前の空白を削除対象に含める
                const textBeforeAttribute = sourceCode.text.slice(0, start)
                const matchBefore = textBeforeAttribute.match(/\s+$/)
                if (matchBefore) {
                  start -= matchBefore[0].length
                }

                // 次のトークンをチェック
                const tokenAfter = sourceCode.getTokenAfter(attribute)
                const isClosingToken = !tokenAfter || tokenAfter.value === '>' || tokenAfter.value === '/>'

                // 次が閉じ括弧の場合のみ、後ろの空白も削除
                if (isClosingToken) {
                  const textAfterAttribute = sourceCode.text.slice(end)
                  const matchAfter = textAfterAttribute.match(/^\s+/)
                  if (matchAfter) {
                    end += matchAfter[0].length
                  }
                }

                return fixer.removeRange([start, end])
              },
            })
          }
        }
      },
    }
  },
}

module.exports.schema = SCHEMA
