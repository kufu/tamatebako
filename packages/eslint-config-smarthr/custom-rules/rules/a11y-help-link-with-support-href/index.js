const SCHEMA = []

const SUPPORT_URL_PREFIX_REGEX = /(\/|\.)support\./
const SUPPORT_IDENTIFIER_REGEX = /(S|(^|_)s)upport(.*)(H(ref|REF)|U(rl|URL))$/
const PATH_OBJ_REGEX = /^((p|P)ath|PATH)\./
const SUPPORT_PATH_MEMBER_REGEX = /\.support\./

const ANCHER_LIKE_REGEX = /(Anchor(Button)?|Link|^a)$/
const HELP_LINK_REGEX = /HelpLink$/

const checkSupportURL = (node, context) => {
  switch (node.type) {
    case 'Literal': {
      return SUPPORT_URL_PREFIX_REGEX.test(node.value)
    }
    case 'JSXExpressionContainer': {
      return checkSupportURLExpression(node.expression, context)
    }
  }

  return false
}

const checkSupportURLExpression = (node, context) => {
  switch (node.type) {
    case 'Literal': {
      return SUPPORT_URL_PREFIX_REGEX.test(node.value)
    }
    case 'Identifier': {
      return SUPPORT_IDENTIFIER_REGEX.test(node.name)
    }
    case 'CallExpression':
    case 'ChainExpression':
    case 'MemberExpression': {
      const fullName = context.sourceCode.getText(node)

      return PATH_OBJ_REGEX.test(fullName) && SUPPORT_PATH_MEMBER_REGEX.test(fullName)
    }
    case 'TemplateLiteral': {
      const someChecker = (e) => checkSupportURLExpression(e, context)

      return node.expressions.some(someChecker) || node.quasis.some(someChecker)
    }
    case 'TemplateElement': {
      return node.value.raw && SUPPORT_URL_PREFIX_REGEX.test(node.value.raw)
    }
    case 'TSAsExpression': {
      return checkSupportURLExpression(node.expression, context)
    }
    case 'LogicalExpression': {
      return checkSupportURLExpression(node.left, context) || checkSupportURLExpression(node.right, context)
    }
    case 'ConditionalExpression': {
      return checkSupportURLExpression(node.alternate, context) || checkSupportURLExpression(node.consequent, context)
    }
  }

  return false
}

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    return {
      JSXAttribute: (node) => {
        if (node.name.name === 'href' && ANCHER_LIKE_REGEX.test(node.parent.name.name) && !HELP_LINK_REGEX.test(node.parent.name.name) && checkSupportURL(node.value, context)) {
          context.report({
            node,
            message: `ヘルプページ用のリンクは smarthr-ui/HelpLink コンポーネントを利用してください`,
          });
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
