const SCHEMA = []

const JSX_EXPRESSION_CONTAINER = '[value.type="JSXExpressionContainer"]'
const ARIA_LABELLEDBY = 'JSXAttribute[name.name="aria-labelledby"]'
const SELECTOR_LITERAL = `${ARIA_LABELLEDBY}:matches([value.type="Literal"],${JSX_EXPRESSION_CONTAINER}[value.expression.type="Literal"])`
const SELECTOR_TEMPLATE_LITERAL = `${ARIA_LABELLEDBY}${JSX_EXPRESSION_CONTAINER}[value.expression.type="TemplateLiteral"]:has(:matches(TemplateElement[value.raw]:not([value.raw=/^(| )$/]),Literal))`

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    const reportError = (node) =>
      context.report({
        node,
        message: `aria-labelledby属性には画面上に存在する別要素に指定したid属性と同じ値を指定する必要があります。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-aria-labelledby
 - 設定する値を変数化したうえでaria-labelledby属性に設定してください`,
      })

    return {
      [SELECTOR_LITERAL]: reportError,
      [SELECTOR_TEMPLATE_LITERAL]: reportError,
    }
  },
}
module.exports.schema = SCHEMA
