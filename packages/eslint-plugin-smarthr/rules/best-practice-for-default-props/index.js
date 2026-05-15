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
  // 数値と文字列の比較（gap={1}とgap="1"は等しいとみなす）
  if (typeof value1 === 'number' && typeof value2 === 'string') {
    return value1 === Number(value2)
  }
  if (typeof value1 === 'string' && typeof value2 === 'number') {
    return Number(value1) === value2
  }
  // ブール値の比較
  if (typeof value1 === 'boolean' && typeof value2 === 'boolean') {
    return value1 === value2
  }
  // 文字列・数値の比較
  return value1 === value2
}

/**
 * JSXAttributeの値を取得
 * @param {import('@typescript-eslint/utils').TSESTree.JSXAttribute} attribute
 * @returns {*}
 */
const getAttributeValue = (attribute) => {
  if (!attribute.value) {
    // <Component prop /> の形式はtrueとみなす
    return true
  }

  if (attribute.value.type === 'Literal') {
    return attribute.value.value
  }

  if (attribute.value.type === 'JSXExpressionContainer') {
    const expression = attribute.value.expression
    if (expression.type === 'Literal') {
      return expression.value
    }
    if (expression.type === 'Identifier' && expression.name === 'false') {
      return false
    }
    if (expression.type === 'Identifier' && expression.name === 'true') {
      return true
    }
    if (expression.type === 'UnaryExpression' && expression.operator === '-') {
      if (expression.argument.type === 'Literal') {
        return -expression.argument.value
      }
    }
  }

  return undefined
}

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: SCHEMA,
    messages: {
      redundantProp: 'prop "{{propName}}" はデフォルト値({{defaultValue}})と同じため不要です',
    },
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
        // コンポーネント名を取得
        let componentName
        if (node.name.type === 'JSXIdentifier') {
          componentName = node.name.name
        } else {
          return
        }

        // このコンポーネントのデフォルト値定義があるかチェック
        const defaultProps = mergedDefaultProps[componentName]
        if (!defaultProps) {
          return
        }

        // 各attributeをチェック
        for (const attribute of node.attributes) {
          if (attribute.type !== 'JSXAttribute') {
            continue
          }

          const propName = attribute.name.name
          if (typeof propName !== 'string') {
            continue
          }

          // このpropにデフォルト値が定義されているかチェック
          if (!(propName in defaultProps)) {
            continue
          }

          const defaultValue = defaultProps[propName]
          const actualValue = getAttributeValue(attribute)

          // デフォルト値と実際の値が一致する場合、エラー報告
          if (actualValue !== undefined && isEqual(actualValue, defaultValue)) {
            context.report({
              node: attribute,
              messageId: 'redundantProp',
              data: {
                propName,
                defaultValue: JSON.stringify(defaultValue),
              },
              fix(fixer) {
                // 属性を削除
                const sourceCode = context.sourceCode || context.getSourceCode()

                // 属性の前後の空白を含めて削除範囲を決定
                let start = attribute.range[0]
                let end = attribute.range[1]

                // 属性の前の空白を削除対象に含める
                const textBeforeAttribute = sourceCode.text.slice(0, start)
                const matchBefore = textBeforeAttribute.match(/\s+$/)
                if (matchBefore) {
                  start -= matchBefore[0].length
                }

                // 次の属性がある場合は、その前の空白は削除しない
                // 次のトークンが閉じ括弧の場合は、後ろの空白も削除
                const tokenAfter = sourceCode.getTokenAfter(attribute)
                if (tokenAfter && tokenAfter.value !== '>' && tokenAfter.value !== '/>') {
                  // 次の属性がある場合は、属性だけを削除
                  // （次の属性の前の空白は残す）
                } else {
                  // 次が閉じ括弧の場合は、後ろの空白も削除
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
