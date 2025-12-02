/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    schema: [],
    messages: {
      default: '{{cell}} の子孫に {{component}} を置くことはできません。代わりに {{preferred}} を使用してください。',
    },
  },
  create(context) {
    return {
      'JSXElement[openingElement.name.name=/Td$/] JSXElement[openingElement.name.name=/Check(b|B)ox$/][children.length=0]': (node) => {
        context.report({
          node,
          messageId: 'default',
          data: {
            cell: 'Td',
            component: 'Checkbox',
            preferred: 'TdCheckbox',
          },
        })
      },
      'JSXElement[openingElement.name.name=/Td$/] JSXElement[openingElement.name.name=/RadioButton$/][children.length=0]': (node) => {
        context.report({
          node,
          messageId: 'default',
          data: {
            cell: 'Td',
            component: 'RadioButton',
            preferred: 'TdRadioButton',
          },
        })
      },
      'JSXElement[openingElement.name.name=/Th$/] JSXElement[openingElement.name.name=/Check(b|B)ox$/][children.length=0]': (node) => {
        context.report({
          node,
          messageId: 'default',
          data: {
            cell: 'Th',
            component: 'Checkbox',
            preferred: 'ThCheckbox',
          },
        })
      },
    }
  },
}

module.exports.schema = []
