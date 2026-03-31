const SCHEMA = []

const ERROR_MESSAGE = `ResponseMessageは見出しやラベルでは使用できません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-response-message
 - ResponseMessageはAPIの実行結果を表示する目的のコンポーネントです
 - 見出しやラベルにアイコンを表示したい場合は、Headingのicon属性、FormControlのlabel.icon属性、Fieldsetのlegend.icon属性、またはsmarthr-ui/Textを使用してください`

// 共通パターン
const RESPONSE_MESSAGE_OPENING = 'JSXOpeningElement[name.name=/ResponseMessage$/]'
const JSX_EXPRESSION_CONTAINER = 'JSXExpressionContainer'

const SELECTOR = [
  // Heading系（h1-h6, Heading, PageHeading）のchildren内
  `JSXElement[openingElement.name.name=/((^h(1|2|3|4|5|6))|Heading|PageHeading)$/] ${RESPONSE_MESSAGE_OPENING}`,
  // FormControlのlabel属性内
  `JSXOpeningElement[name.name=/FormControl$/] > JSXAttribute[name.name="label"] ${JSX_EXPRESSION_CONTAINER} ${RESPONSE_MESSAGE_OPENING}`,
  // Fieldsetのlegend属性内
  `JSXOpeningElement[name.name=/Fieldset$/] > JSXAttribute[name.name="legend"] ${JSX_EXPRESSION_CONTAINER} ${RESPONSE_MESSAGE_OPENING}`,
  // label/legend要素のchildren内
  `JSXElement[openingElement.name.name=/^(label|legend)$/] ${RESPONSE_MESSAGE_OPENING}`,
].join(', ')

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
      [SELECTOR]: (node) => {
        context.report({
          node,
          message: ERROR_MESSAGE,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
