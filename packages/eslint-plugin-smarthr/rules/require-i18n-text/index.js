const NOOP = () => {}

const SCHEMA = [
  {
    type: 'object',
    properties: {
      elements: {
        type: 'object',
        patternProperties: {
          '.+': {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        default: {},
      },
    },
    additionalProperties: false,
  }
]

const isStringLiteral = (node) => {
  if (!node) return false

  // 直接の文字列リテラル
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value !== ''
  }

  // JSXExpressionContainer内の文字列リテラル
  if (node.type === 'JSXExpressionContainer') {
    const expr = node.expression
    if (expr.type === 'Literal' && typeof expr.value === 'string') {
      return expr.value !== ''
    }
  }

  return false
}

const getElementName = (node) => {
  if (node.name.type === 'JSXIdentifier') {
    return node.name.name
  }
  return null
}

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    schema: SCHEMA,
  },
  create(context) {
    const options = context.options[0] || {}

    // elementsをMap<string, Set<string>>に変換
    const elementsObj = options.elements || {}
    const elements = new Map(
      Object.entries(elementsObj).map(([elementName, attributes]) => [
        elementName,
        new Set(attributes)
      ])
    )

    // ワイルドカード '*' の属性セット
    const wildcardAttributes = elements.get('*')

    let JSXOpeningElement = NOOP

    if (elements.size > 0) {
      JSXOpeningElement = (node) => {
        const elementName = getElementName(node)
        if (!elementName) return

        node.attributes.forEach((attr) => {
          if (attr.type !== 'JSXAttribute') return

          const attrName = attr.name.name

          // 個別の要素設定があればそれを優先、なければワイルドカード
          const elementAttributes = elements.get(elementName) || wildcardAttributes
          if (elementAttributes?.has(attrName) && isStringLiteral(attr.value)) {
            context.report({
              node: attr,
              message: `${elementName}の${attrName}属性に文字列リテラルが指定されています。多言語化対応のため、翻訳関数を使用してください`,
            })
          }
        })
      }
    }

    return {
      JSXOpeningElement,
      JSXText: (node) => {
        // 空白文字のみの場合はスキップ
        const text = node.value.trim()
        if (text === '') return

        context.report({
          node,
          message: '子要素に文字列リテラルが指定されています。多言語化対応のため、翻訳関数を使用してください',
        })
      },
    }
  },
}

module.exports.schema = SCHEMA
