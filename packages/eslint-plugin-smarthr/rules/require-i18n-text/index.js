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

// デフォルトのワイルドカード設定
const DEFAULT_WILDCARD_ATTRIBUTES = ['alt', 'aria-label', 'term', 'title']

const generateAttributeSelector = (attributes) =>
  `JSXAttribute[name.name=/^(${attributes.join('|')})$/][value.type="Literal"][value.value=/\\S/]`

const generateTemplateLiteralSelector = (attributes) =>
  `JSXAttribute[name.name=/^(${attributes.join('|')})$/][value.type="JSXExpressionContainer"][value.expression.type="TemplateLiteral"]`

const REGEX_IGNORE_FILENAME = /\.(spec|test|stories)\./
const REGEX_IGNORE_TEXT = /^\s*(\.|\+|\-|〜|：|:|（|）|\(|\)|,|\*|\/|[0-9]+)\s*$/
const checkIgnoreText = (text) => !REGEX_IGNORE_TEXT.test(text)

const someReportTemplateLiteralError = (quasi) => quasi.value.cooked && quasi.value.cooked.trim() !== '' && checkIgnoreText(quasi.value.cooked)

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    schema: SCHEMA,
  },
  create(context) {
    if (REGEX_IGNORE_FILENAME.test(context.getFilename())) {
      return {}
    }

    const elementsObj = (context.options[0] || {}).elements || {}
    // ユーザーが'*'を設定していない場合のみデフォルトを適用
    const wildcardAttributes = elementsObj['*'] || DEFAULT_WILDCARD_ATTRIBUTES
    const specificElements = []
    for (const k in elementsObj) {
      if (k !== '*') {
        specificElements.push(k)
      }
    }
    const handlers = {}

    const reportAttributeError = (node) => {
      if (checkIgnoreText(node.value.value)) {
        context.report({
          node,
          message: `${node.parent.name.name}の${node.name.name}属性に文字列リテラル "${node.value.value.trim()}" が指定されています。多言語化対応のため、翻訳関数を使用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-i18n-text`,
        })
      }
    }

    const reportTemplateLiteralError = (node) => {
      if (node.value.expression.quasis.some(someReportTemplateLiteralError)) {
        context.report({
          node,
          message: `${node.parent.name.name}の${node.name.name}属性に文字列リテラルが指定されています。多言語化対応のため、翻訳関数を使用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-i18n-text`,
        })
      }
    }

    // 個別要素の設定
    for (const elementName of specificElements) {
      const attributes = elementsObj[elementName]

      if (attributes.length !== 0) {
        handlers[`JSXOpeningElement[name.name="${elementName}"] > ${generateAttributeSelector(attributes)}`] = reportAttributeError
        handlers[`JSXOpeningElement[name.name="${elementName}"] > ${generateTemplateLiteralSelector(attributes)}`] = reportTemplateLiteralError
      }
    }

    // ワイルドカード設定
    if (wildcardAttributes && wildcardAttributes.length > 0) {
      const attributeSelector = generateAttributeSelector(wildcardAttributes)
      const templateLiteralSelector = generateTemplateLiteralSelector(wildcardAttributes)

      const baseSelector = specificElements.length > 0
        ? `JSXOpeningElement:not([name.name=/^(${specificElements.join('|')})$/]) > `
        : ''

      handlers[baseSelector + attributeSelector] = reportAttributeError
      handlers[baseSelector + templateLiteralSelector] = reportTemplateLiteralError
    }

    // 子要素の文字列リテラルチェック（空白のみのテキストは除外）
    handlers['JSXText[value=/\\S/]'] = (node) => {
      if (checkIgnoreText(node.value)) {
        context.report({
          node,
          message: `子要素に文字列リテラル "${node.value.trim()}" が指定されています。多言語化対応のため、翻訳関数を使用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-i18n-text`,
        })
      }
    }

    return handlers
  },
}

module.exports.schema = SCHEMA
