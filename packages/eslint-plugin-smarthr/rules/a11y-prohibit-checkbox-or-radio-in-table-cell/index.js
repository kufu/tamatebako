const findClosestThFromAncestor = (node) => {
  if (node.type === 'JSXElement' && node.openingElement.name.name === 'Th') {
    return node
  }
  if (node.parent) {
    return findClosestThFromAncestor(node.parent)
  }
}

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
    const sourceCode = context.sourceCode

    return {
      'JSXElement[openingElement.name.name=/Td$/] JSXElement[openingElement.name.name=/Checkbox$/]': (node) => {
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
      'JSXElement[openingElement.name.name=/Td$/] JSXElement[openingElement.name.name=/RadioButton$/]': (node) => {
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
      'JSXElement[openingElement.name.name=/Th$/] JSXElement[openingElement.name.name=/Checkbox$/]': (node) => {
        context.report({
          node,
          messageId: 'default',
          data: {
            cell: 'Th',
            component: 'Checkbox',
            preferred: 'ThCheckbox',
          },
          *fix(fixer) {
            const th = findClosestThFromAncestor(node)
            if (!th) {
              return
            }

            const thCheckbox = sourceCode.getText(node).replace('<Checkbox', '<ThCheckbox')
            yield fixer.insertTextAfter(th, thCheckbox)
            yield fixer.remove(th)
          },
        })
      },
    }
  },
}

module.exports.schema = []
