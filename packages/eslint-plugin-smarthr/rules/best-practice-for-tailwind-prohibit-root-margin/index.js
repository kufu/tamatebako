const SCHEMA = []

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    return {
      ':matches(ArrowFunctionExpression,FunctionDeclaration,ReturnStatement)>JSXElement>JSXOpeningElement JSXAttribute[name.name="className"][value.value=/( |^)shr-m[trbl]?-/]': (node) => {
        context.report({
          node,
          message: 'コンポーネントのルート要素に外側への余白（margin）を設定しないでください。外側の余白は使用する側で制御するべきです。',
        })
      },
    }
  },
}

module.exports.schema = SCHEMA
