// デフォルトのワイルドカード設定
const DEFAULT_WILDCARD_ATTRIBUTES = [
  'alt',
  'aria-label',
  // smarthr-ui DefinitionListItem
  'term',
  'title',
]

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
  },
]

// 文字列リテラルを持つ属性を選択するセレクタの条件部分
const STRING_LITERAL_CONDITION =
  ':matches([value.type="Literal"][value.value=/\\S/], [value.type="JSXExpressionContainer"][value.expression.type="Literal"][value.expression.value=/\\S/])'

const generateAttributeSelector = (attributes) =>
  `JSXAttribute[name.name=/^(${attributes.join('|')})$/]${STRING_LITERAL_CONDITION}`

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
    const elementsObj = options.elements || {}

    // ユーザーが'*'を設定していない場合のみデフォルトを適用
    const wildcardAttributes = elementsObj['*'] || DEFAULT_WILDCARD_ATTRIBUTES
    const specificElements = Object.keys(elementsObj).filter((k) => k !== '*')
    const handlers = {}

    const reportAttributeError = (node) => {
      context.report({
        node,
        message: `${node.parent.name.name}の${node.name.name}属性に文字列リテラルが指定されています。多言語化対応のため、翻訳関数を使用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-i18n-text`,
      })
    }

    // 個別要素の設定
    for (const elementName of specificElements) {
      const attributes = elementsObj[elementName]
      if (attributes.length === 0) continue

      handlers[`JSXOpeningElement[name.name="${elementName}"] > ${generateAttributeSelector(attributes)}`] = reportAttributeError
    }

    // ワイルドカード設定
    if (wildcardAttributes && wildcardAttributes.length > 0) {
      const attributeSelector = generateAttributeSelector(wildcardAttributes)
      if (specificElements.length > 0) {
        // 個別設定要素を除外
        handlers[`JSXOpeningElement:not([name.name=/^(${specificElements.join('|')})$/]) > ${attributeSelector}`] =
          reportAttributeError
      } else {
        handlers[attributeSelector] = reportAttributeError
      }
    }

    // 子要素の文字列リテラルチェック（空白のみのテキストは除外）
    handlers['JSXText[value=/\\S/]'] = (node) => {
      context.report({
        node,
        message: `子要素に文字列リテラルが指定されています。多言語化対応のため、翻訳関数を使用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-i18n-text`,
      })
    }

    return handlers
  },
}

module.exports.schema = SCHEMA
