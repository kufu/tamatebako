const SCHEMA = []
const EXTRA_SPACE_REGES = /(^\s+|\s+$)/

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
      JSXOpeningElement: (node) =>
        node.attributes.forEach((current) => {
          const attribute = current.value?.type === 'JSXExpressionContainer' ? current.value.expression : current.value
          const props = attribute?.value

          if (typeof props === 'string' && EXTRA_SPACE_REGES.test(props)) {
            return context.report({
              node,
              loc: current.loc,
              message: '属性に設定している文字列から先頭、末尾の空白文字を削除してください',
              fix(fixer) {
                return fixer.replaceTextRange([attribute.range[0] + 1, attribute.range[1] - 1], props.trim())
              },
            })
          }
        })
    }
  },
}

module.exports.schema = SCHEMA
