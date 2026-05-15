/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */

const DEFINITION_LIST_PATTERN = /DefinitionList$/

const getPreviousSibling = (node) => {
  const parent = node.parent
  if (!parent || (parent.type !== 'JSXElement' && parent.type !== 'JSXFragment')) {
    return null
  }

  const children = parent.children || []
  const currentIndex = children.indexOf(node)

  for (let i = currentIndex - 1; i >= 0; i--) {
    const child = children[i]

    if (
      (child.type !== 'JSXText' || child.value.trim() !== '') &&
      (child.type !== 'JSXExpressionContainer' || child.expression.type !== 'JSXEmptyExpression')
    ) {
      return child
    }
  }

  return null
}

module.exports = {
  meta: {
    type: 'suggestion',
    schema: [],
  },
  create(context) {
    return {
      [`JSXElement[openingElement.name.name=${DEFINITION_LIST_PATTERN}]`](node) {
        const prev = getPreviousSibling(node)

        if (prev?.type === 'JSXElement' && DEFINITION_LIST_PATTERN.test(prev.openingElement.name.name)) {
          context.report({
            node: node.openingElement.name,
            message: `DefinitionList が連続しています
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-consecutive-definition-list
 - DefinitionListItem の maxColumns prop を使用して1つにまとめることを検討してください
 - 例外: 意味的に異なるグループの場合は複数のDefinitionListを使用しても問題ありません`,
          })
        }
      },
    }
  },
}
