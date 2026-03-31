const SCHEMA = []

const ERROR_MESSAGE = `ResponseMessageは見出しやラベルでは使用できません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-response-message
 - ResponseMessageはAPIの実行結果を表示する目的のコンポーネントであり、静的な見出しやラベル、アイコンの配置調整のためのコンポーネントではありません
 - 見出しやラベルにアイコンを表示したい場合は、smarthr-ui/Iconなど適切なコンポーネントを使用してください`

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
      // Heading系（h1-h6, Heading, PageHeading）のchildren内のResponseMessage
      'JSXElement[openingElement.name.name=/((^h(1|2|3|4|5|6))|Heading|PageHeading)$/] JSXOpeningElement[name.name="ResponseMessage"]': (node) => {
        context.report({
          node,
          message: ERROR_MESSAGE,
        })
      },

      // FormControlのlabel属性内のResponseMessage
      'JSXOpeningElement[name.name=/FormControl$/] > JSXAttribute[name.name="label"] JSXExpressionContainer JSXOpeningElement[name.name="ResponseMessage"]': (node) => {
        context.report({
          node,
          message: ERROR_MESSAGE,
        })
      },

      // Fieldsetのlegend属性内のResponseMessage
      'JSXOpeningElement[name.name=/Fieldset$/] > JSXAttribute[name.name="legend"] JSXExpressionContainer JSXOpeningElement[name.name="ResponseMessage"]': (node) => {
        context.report({
          node,
          message: ERROR_MESSAGE,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
