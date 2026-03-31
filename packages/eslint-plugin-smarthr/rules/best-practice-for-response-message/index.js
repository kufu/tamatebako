const SCHEMA = []

const ERROR_MESSAGE = `ResponseMessageは見出しやラベルでは使用できません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-response-message
 - ResponseMessageはAPIの実行結果を表示する目的のコンポーネントです
 - 見出しやラベルにアイコンを表示したい場合は、Headingのicon属性、FormControlのlabel.icon属性、Fieldsetのlegend.icon属性、またはsmarthr-ui/Textを使用してください`

// 共通パターン
const RESPONSE_MESSAGE = 'JSXOpeningElement[name.name=/ResponseMessage$/]'
const LABEL_LEGEND = '/^(label|legend)$/'

const SELECTOR = `:matches(JSXElement[openingElement.name.name=/((^h(1|2|3|4|5|6))|(Page)?Heading)$/] ${RESPONSE_MESSAGE}, JSXOpeningElement[name.name=/^(FormControl|Fieldset)$/] > JSXAttribute[name.name=${LABEL_LEGEND}] JSXExpressionContainer ${RESPONSE_MESSAGE}, JSXElement[openingElement.name.name=${LABEL_LEGEND}] ${RESPONSE_MESSAGE})`

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
