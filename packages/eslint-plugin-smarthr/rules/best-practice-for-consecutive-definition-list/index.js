/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */

const DEFINITION_LIST = 'JSXElement[openingElement.name.name=/DefinitionList$/]'
const WHITESPACE_TEXT = 'JSXText[value=/^\\s*$/]'
const EMPTY_EXPRESSION = 'JSXExpressionContainer[expression.type="JSXEmptyExpression"]'
const ERROR_MESSAGE = `DefinitionList が連続しています
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-consecutive-definition-list
 - DefinitionListItem の maxColumns prop を使用して1つにまとめることを検討してください
 - 例外: 意味的に異なるグループの場合は複数のDefinitionListを使用しても問題ありません`

module.exports = {
  meta: {
    type: 'suggestion',
    schema: [],
  },
  create(context) {
    const reporter = (node) => {
      context.report({
        node: node.openingElement.name,
        message: ERROR_MESSAGE,
      })
    }

    return {
      // 1. 直接隣接
      [`${DEFINITION_LIST} + ${DEFINITION_LIST}`]: reporter,
      // 2. 空白・改行のみのJSXText経由
      [`${DEFINITION_LIST} + ${WHITESPACE_TEXT} + ${DEFINITION_LIST}`]: reporter,
      // 3. JSXコメント（{/* */}、{}）経由
      [`${DEFINITION_LIST} + ${EMPTY_EXPRESSION} + ${DEFINITION_LIST}`]: reporter,
      // 4. 空白・改行 + JSXコメント
      [`${DEFINITION_LIST} + ${WHITESPACE_TEXT} + ${EMPTY_EXPRESSION} + ${DEFINITION_LIST}`]: reporter,
      // 5. JSXコメント + 空白・改行
      [`${DEFINITION_LIST} + ${EMPTY_EXPRESSION} + ${WHITESPACE_TEXT} + ${DEFINITION_LIST}`]: reporter,
      // 6. 空白・改行 + JSXコメント + 空白・改行
      [`${DEFINITION_LIST} + ${WHITESPACE_TEXT} + ${EMPTY_EXPRESSION} + ${WHITESPACE_TEXT} + ${DEFINITION_LIST}`]: reporter,
    }
  },
}
