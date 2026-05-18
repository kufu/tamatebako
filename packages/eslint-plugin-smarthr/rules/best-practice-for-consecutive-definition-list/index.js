/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */

const DEFINITION_LIST = 'JSXElement[openingElement.name.name=/DefinitionList$/]'
const WHITESPACE_TEXT = 'JSXText[value=/^\\s*$/]'
const EMPTY_EXPRESSION = 'JSXExpressionContainer[expression.type="JSXEmptyExpression"]'

// セレクターを事前定義（パフォーマンス最適化）
const SELECTOR_1 = `${DEFINITION_LIST} + ${DEFINITION_LIST}`
const SELECTOR_2 = `${DEFINITION_LIST} + ${WHITESPACE_TEXT} + ${DEFINITION_LIST}`
const SELECTOR_3 = `${DEFINITION_LIST} + ${EMPTY_EXPRESSION} + ${DEFINITION_LIST}`
const SELECTOR_4 = `${DEFINITION_LIST} + ${WHITESPACE_TEXT} + ${EMPTY_EXPRESSION} + ${DEFINITION_LIST}`
const SELECTOR_5 = `${DEFINITION_LIST} + ${EMPTY_EXPRESSION} + ${WHITESPACE_TEXT} + ${DEFINITION_LIST}`
const SELECTOR_6 = `${DEFINITION_LIST} + ${WHITESPACE_TEXT} + ${EMPTY_EXPRESSION} + ${WHITESPACE_TEXT} + ${DEFINITION_LIST}`

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
      [SELECTOR_1]: reporter,
      // 2. 空白・改行のみのJSXText経由
      [SELECTOR_2]: reporter,
      // 3. JSXコメント（{/* */}、{}）経由
      [SELECTOR_3]: reporter,
      // 4. 空白・改行 + JSXコメント
      [SELECTOR_4]: reporter,
      // 5. JSXコメント + 空白・改行
      [SELECTOR_5]: reporter,
      // 6. 空白・改行 + JSXコメント + 空白・改行
      [SELECTOR_6]: reporter,
    }
  },
}
