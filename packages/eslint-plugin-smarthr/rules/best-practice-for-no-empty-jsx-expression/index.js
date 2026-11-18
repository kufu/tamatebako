const SCHEMA = [
  {
    type: 'object',
    properties: {
      fix: {
        type: 'boolean',
        default: false,
      },
    },
    additionalProperties: false,
  },
]

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: SCHEMA,
    messages: {
      noEmptyJSXExpression:
        '空のJSX式({})は何もレンダリングしないため不要です。削除してください。eslintのdisableコメントが不要になって自動削除された際などに残ってしまうことがあります。',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode()
    const options = context.options[0] || {}
    const fix = options.fix

    return {
      'JSXExpressionContainer > JSXEmptyExpression': (node) => {
        const container = node.parent

        // {/* comment */} のようにコメントが残っている場合は対象外
        // (コメントの削除は本ルールの責務ではないため)
        if (sourceCode.getCommentsInside(container).length > 0) {
          return
        }

        context.report({
          node: container,
          messageId: 'noEmptyJSXExpression',
          fix: fix ? (fixer) => fixer.remove(container) : null,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
