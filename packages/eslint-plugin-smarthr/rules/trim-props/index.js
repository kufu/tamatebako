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
    const checker = (node) => {
      return context.report({
        node,
        message: `属性に設定している文字列から先頭、末尾の空白文字を削除してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/trim-props`,
        fix: (fixer) => fixer.replaceText(node, context.sourceCode.getText(node).replace(/^('|"|`)\s+/, '$1').replace(/\s+('|"|`)$/, '$1')),
      })
    }

    return {
      'JSXAttribute > Literal[value=/(^ | $)/]': checker,
      'JSXAttribute > JSXExpressionContainer>Literal[value=/(^ | $)/]': checker,
      'JSXAttribute > JSXExpressionContainer > TemplateLiteral > TemplateElement:matches(:first-child[value.raw=/^ /],:last-child[value.raw=/ $/])': (node) => {
        checker(node.parent)
      },
    }
  },
}

module.exports.schema = SCHEMA
