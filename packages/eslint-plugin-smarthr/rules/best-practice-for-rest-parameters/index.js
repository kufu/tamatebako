const SCHEMA = []

const MEMBER_EXPRESSION_REST_REGEX = /^rest\./
const DETAIL_LINK = `
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-rest-parameters`

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    schema: SCHEMA,
  },
  create(context) {
    const actionNotRest = (node) => {
      context.report({
        node,
        message: `残余引数以外に 'rest' という名称を利用しないでください${DETAIL_LINK}
 - 残余引数(rest parameters)と混同する可能性があるため別の名称に修正してください`,
      });
    }
    const actionMemberExpressionName = (node) => {
      if (node.parent.type === 'MemberExpression') {
        return actionMemberExpressionName(node.parent)
      }

      if (MEMBER_EXPRESSION_REST_REGEX.test(context.sourceCode.getText(node))){
        context.report({
          node,
          message: `残余引数内の属性を参照しないでください${DETAIL_LINK}`,
        });
      }
    }

    return {
      [`RestElement:not([argument.name='rest'])`]: (node) => {
        context.report({
          node,
          message: `残余引数には 'rest' という名称を指定してください${DETAIL_LINK}`,
        });
      },
      [`:not(:matches(RestElement,JSXSpreadAttribute,JSXSpreadAttribute>TSAsExpression,SpreadElement,SpreadElement>TSAsExpression,MemberExpression,VariableDeclarator,ArrayExpression,CallExpression,ObjectPattern>Property,ObjectExpression>Property))>Identifier[name='rest']`]: actionNotRest,
      [`:matches(VariableDeclarator[id.name='rest'],ObjectPattern>Property[value.name='rest'],ObjectExpression>Property[key.name='rest'])`]: actionNotRest,
      [`MemberExpression[object.name='rest']`]: actionMemberExpressionName,
    }
  },
}
module.exports.schema = SCHEMA
