const SCHEMA = []

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
      'JSXAttribute Literal[value=/(^ | $)/]': (node) => {
        return context.report({
          node,
          message: '属性に設定している文字列から先頭、末尾の空白文字を削除してください',
          fix: (fixer) => fixer.replaceText(node, context.sourceCode.getText(node).replace(/^('|")\s+/, '$1').replace(/\s+('|")$/, '$1')),
        })
      },
      'JSXAttribute TemplateLiteral:has(TemplateElement:matches(:first-child[value.raw=/^ /],:last-child[value.raw=/ $/]))': (node) => {
        return context.report({
          node,
          message: '属性に設定している文字列から先頭、末尾の空白文字を削除してください',
          fix: (fixer) => fixer.replaceText(node, context.sourceCode.getText(node).replace(/(^`\s+|\s+`$)/g, '`')),
        })
      },
    }
  },
}

module.exports.schema = SCHEMA
