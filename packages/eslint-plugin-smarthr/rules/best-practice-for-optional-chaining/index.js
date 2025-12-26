const SCHEMA = []

const REPLACABLE_CALLEE = `[consequent.expression.callee.type='Identifier']`
const WITHOUT_BODY_IF_ID = `[test.type='Identifier']${REPLACABLE_CALLEE}`
const WITH_BODY_IF_ID = WITHOUT_BODY_IF_ID.replace(REPLACABLE_CALLEE, "[consequent.body.length=1][consequent.body.0.expression.callee.type='Identifier']")
const SELECTOR = `IfStatement[alternate=null]:not([parent.type='IfStatement']):matches(${WITHOUT_BODY_IF_ID},${WITHOUT_BODY_IF_ID.replaceAll("'Identifier'", "'MemberExpression'")},${WITH_BODY_IF_ID},${WITH_BODY_IF_ID.replaceAll("'Identifier'", "'MemberExpression'")})`


/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: SCHEMA,
  },
  create(context) {
    return {
      [SELECTOR]: (node) => {
        const expression = node.consequent.expression || node.consequent.body[0].expression
        const calleName = context.sourceCode.getText(expression.callee)

        if (context.sourceCode.getText(node.test) === calleName) {
          context.report({
            node,
            message: `optional chaining(xxx?.yyyy記法)を利用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-optional-chaining`,
            fix: (fixer) => fixer.replaceText(
              node,
              context.sourceCode.getText(expression).replace(new RegExp(`^${calleName}\\(`), `${calleName}\?\.(`),
            ),
          })
        }
      },
    }
  },
}
module.exports.schema = SCHEMA

