const SCHEMA = []

const REST_REGEX = /(^r|R)est$/
const MEMBER_EXPRESSION_REST_REGEX = /^(r|[a-zA-Z0-9_]+R)est\./

const UNFORMAT_NAME__REST_ELEMENT_SELECTOR = `RestElement:not([argument.name=${REST_REGEX}])`
const CONFUSING_NAME_VARIABLE_SELECTOR_1 = `:not(:matches(RestElement,JSXSpreadAttribute,JSXSpreadAttribute > TSAsExpression,SpreadElement,SpreadElement > TSAsExpression,MemberExpression,BinaryExpression,VariableDeclarator,ArrayExpression,CallExpression,ObjectPattern > Property,ObjectExpression > Property,ReturnStatement,ArrowFunctionExpression)) > Identifier[name=${REST_REGEX}]`
const CONFUSING_NAME_VARIABLE_SELECTOR_2 = `:matches(VariableDeclarator[id.name=${REST_REGEX}],ObjectPattern > Property[value.name=${REST_REGEX}],ObjectExpression > Property[key.name=${REST_REGEX}])`
const ARROW_FUNCTION_PARAMS_SELECTOR = `ArrowFunctionExpression > Identifier[name=${REST_REGEX}]`
const USE_REST_VIORATION_SELECTOR_MEMBER_EXPRESSION = `MemberExpression[object.name=${REST_REGEX}]`
const USE_REST_VIORATION_SELECTOR_IN_OPERATOR = `BinaryExpression[operator="in"][right.name=${REST_REGEX}]`
const USE_REST_VIORATION_OBJECT_PATTERN = `VariableDeclarator[id.type='ObjectPattern'][init.name=${REST_REGEX}]`

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
        message: `残余引数以外に ${REST_REGEX} とマッチする名称を利用しないでください${DETAIL_LINK}
 - 残余引数(rest parameters)と混同する可能性があるため別の名称に修正してください`,
      })
    }
    const actionUseRestVioration = (node) => {
      context.report({
        node,
        message: `残余引数内の属性を参照しないでください${DETAIL_LINK}`,
      })
    }
    const actionMemberExpressionName = (node) => {
      if (node.parent.type === 'MemberExpression') {
        return actionMemberExpressionName(node.parent)
      }

      if (MEMBER_EXPRESSION_REST_REGEX.test(context.sourceCode.getText(node))) {
        actionUseRestVioration(node)
      }
    }

    return {
      'ObjectPattern[properties.length=1]>RestElement': (node) => {
        context.report({
          node,
          message: `意味のない残余引数のため、単一の引数に変更してください${DETAIL_LINK}`,
        })
      },
      [UNFORMAT_NAME__REST_ELEMENT_SELECTOR]: (node) => {
        context.report({
          node,
          message: `残余引数には ${REST_REGEX} とマッチする名称を指定してください${DETAIL_LINK}`,
        })
      },
      [CONFUSING_NAME_VARIABLE_SELECTOR_1]: actionNotRest,
      [CONFUSING_NAME_VARIABLE_SELECTOR_2]: actionNotRest,
      [ARROW_FUNCTION_PARAMS_SELECTOR]: (node) => {
        if (node !== node.parent.body) {
          actionNotRest(node)
        }
      },
      [USE_REST_VIORATION_SELECTOR_MEMBER_EXPRESSION]: actionMemberExpressionName,
      [USE_REST_VIORATION_SELECTOR_IN_OPERATOR]: (node) => {
        actionUseRestVioration(node.right)
      },
      [USE_REST_VIORATION_OBJECT_PATTERN]: actionUseRestVioration,
    }
  },
}
module.exports.schema = SCHEMA
