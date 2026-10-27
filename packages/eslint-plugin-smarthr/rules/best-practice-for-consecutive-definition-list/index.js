/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */

const DEFINITION_LIST = 'JSXElement[openingElement.name.name=/DefinitionList$/]'
const WHITESPACE_TEXT = 'JSXText[value=/^\\s*$/]'
const EMPTY_EXPRESSION = 'JSXExpressionContainer[expression.type="JSXEmptyExpression"]'

// 直接隣接（A + B）
const ADJACENT_DIRECT = `${DEFINITION_LIST} + ${DEFINITION_LIST}`
// 空白・改行のみのJSXText経由（A + W + B）
const ADJACENT_WITH_WHITESPACE = `${DEFINITION_LIST} + ${WHITESPACE_TEXT} + ${DEFINITION_LIST}`
// JSXコメント（{/* */}、{}）経由（A + E + B）
const ADJACENT_WITH_COMMENT = `${DEFINITION_LIST} + ${EMPTY_EXPRESSION} + ${DEFINITION_LIST}`
// 空白・改行 + JSXコメント（A + W + E + B）
const ADJACENT_WHITESPACE_COMMENT = `${DEFINITION_LIST} + ${WHITESPACE_TEXT} + ${EMPTY_EXPRESSION} + ${DEFINITION_LIST}`
// JSXコメント + 空白・改行（A + E + W + B）
const ADJACENT_COMMENT_WHITESPACE = `${DEFINITION_LIST} + ${EMPTY_EXPRESSION} + ${WHITESPACE_TEXT} + ${DEFINITION_LIST}`
// 空白・改行 + JSXコメント + 空白・改行（A + W + E + W + B）
const ADJACENT_WHITESPACE_COMMENT_WHITESPACE = `${DEFINITION_LIST} + ${WHITESPACE_TEXT} + ${EMPTY_EXPRESSION} + ${WHITESPACE_TEXT} + ${DEFINITION_LIST}`

module.exports = {
  meta: {
    type: 'suggestion',
    schema: [],
  },
  create(context) {
    const reporter = (node) => {
      context.report({
        node,
        message: `DefinitionList が連続しています
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-consecutive-definition-list
 - DefinitionListItem の maxColumns prop を使用して1つにまとめることを検討してください
 - 例外: 意味的に異なるグループの場合は複数のDefinitionListを使用しても問題ありません`,
      })
    }

    return {
      [ADJACENT_DIRECT]: reporter,
      [ADJACENT_WITH_WHITESPACE]: reporter,
      [ADJACENT_WITH_COMMENT]: reporter,
      [ADJACENT_WHITESPACE_COMMENT]: reporter,
      [ADJACENT_COMMENT_WHITESPACE]: reporter,
      [ADJACENT_WHITESPACE_COMMENT_WHITESPACE]: reporter,
    }
  },
}
