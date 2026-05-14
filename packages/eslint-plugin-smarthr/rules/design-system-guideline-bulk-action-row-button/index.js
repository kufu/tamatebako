const SCHEMA = []

// aタグやLinkコンポーネントを使用している場合
const DO_NOT_USE_LINK = `BulkActionRow内では「Button」コンポーネントを使用してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-bulk-action-row-button
 - aタグやLinkコンポーネントは使用しないでください。
 - もし「すべてのオブジェクトを選択」ボタンの実装であれば、Button[variant="tertiary"]を使用してください。
 - 参考:
  - https://smarthr.design/products/design-patterns/table-bulk-action/#h4-2
  - https://smarthr.design/products/components/table/#h3-2`

// 独自実装のButtonコンポーネント（StyledButtonなど）を使用している場合
const DO_NOT_USE_CUSTOM_BUTTON = `BulkActionRow内では「Button」コンポーネントを使用してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-bulk-action-row-button
 - 独自実装されたButtonコンポーネントは使用しないでください。
 - もし「すべてのオブジェクトを選択」ボタンの実装であれば、Button[variant="tertiary"]を使用してください。
 - 参考:
  - https://smarthr.design/products/design-patterns/table-bulk-action/#h4-2
  - https://smarthr.design/products/components/table/#h3-2`

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
      // BulkActionRow内でaタグやLinkコンポーネントを使用している場合
      'JSXElement[openingElement.name.name="BulkActionRow"] JSXElement:matches([openingElement.name.name="a"], [openingElement.name.name=/[Ll]ink$/])'(
        node,
      ) {
        context.report({
          node: node.openingElement,
          message: DO_NOT_USE_LINK,
        })
      },

      // BulkActionRow内で独自実装のButtonコンポーネントを使用している場合
      'JSXElement[openingElement.name.name="BulkActionRow"] JSXElement[openingElement.name.name=/Button/]:not([openingElement.name.name="Button"])'(
        node,
      ) {
        context.report({
          node: node.openingElement,
          message: DO_NOT_USE_CUSTOM_BUTTON,
        })
      },
    }
  },
}

module.exports.schema = SCHEMA
