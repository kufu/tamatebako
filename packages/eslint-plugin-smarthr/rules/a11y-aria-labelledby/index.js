/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: [],
  },
  create(context) {
    return {
      'JSXAttribute[name.name="aria-labelledby"]:matches([value.type="Literal"],[value.type="JSXExpressionContainer"][value.expression.type="TemplateLiteral"]:has(:matches(TemplateElement[value.raw]:not([value.raw=/^(| )$/]),Literal)))': (node) => {
        context.report({
          node,
          message: `aria-labelledby属性には画面上に存在する別要素に指定したid属性と同じ値を指定する必要があります。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-aria-labelledby
 - 設定する値を変数化したうえでaria-labelledby属性に設定してください`,
        })
      },
    }
  },
}
module.exports.schema = []
