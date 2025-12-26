const SCHEMA = []

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
      [`IfStatement[alternate=null][test.type='Identifier'][consequent.expression.callee.type='Identifier']`]: (node) => {
        if (node.test.name === node.consequent.expression.callee.name) {
          context.report({
            node,
            message: 'optional chaining(xxx?.yyyy記法)を利用してください',
            fix: (fixer) => fixer.replaceText(
              node,
              context.sourceCode.getText(node.consequent.expression).replace(new RegExp(`^${node.test.name}\\((.+?)$`), `${node.test.name}?.($1`),
            ),
          })
        }
      },
      [`IfStatement[alternate=null][test.type='Identifier'][consequent.body.length=1][consequent.body.0.expression.callee.type='Identifier']`]: (node) => {
        if (node.test.name === node.consequent.body[0].expression.callee.name) {
          context.report({
            node,
            message: 'optional chaining(xxx?.yyyy記法)を利用してください',
            fix: (fixer) => fixer.replaceText(
              node,
              context.sourceCode.getText(node.consequent.body[0].expression).replace(new RegExp(`^${node.test.name}\\((.+?)$`), `${node.test.name}?.($1`),
            ),
          })
        }
      },
    }
  },
}
module.exports.schema = SCHEMA

