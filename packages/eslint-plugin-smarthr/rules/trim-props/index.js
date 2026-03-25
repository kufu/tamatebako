const SCHEMA = []

const TRIM_REGEX = /^(['"`])\s*(.+?)\s*(['"`])$/

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    schema: SCHEMA,
    fixable: 'whitespace',
  },
  create(context) {
    return {
      ':matches(JSXAttribute > Literal[value=/(^ | $)/], JSXAttribute > JSXExpressionContainer > TemplateLiteral:has(> TemplateElement:matches(:first-child[value.raw=/^ /],:last-child[value.raw=/ $/])))': (node) => {
        context.report({
          node,
          message: `属性に設定している文字列から先頭、末尾の空白文字を削除してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/trim-props`,
          fix: (fixer) => fixer.replaceText(node, context.sourceCode.getText(node).replace(TRIM_REGEX, '$1$2$3')),
        })
      },
    }
  },
}

module.exports.schema = SCHEMA
