const SCHEMA = []

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    schema: SCHEMA,
  },
  create(context) {
    return {
      // as属性のみを持つパターン
      'JSXOpeningElement[name.name="Text"]:has(JSXAttribute[name.name="as"]):not(:has(JSXAttribute[name.name!="as"]))': (node) => {
        const asAttribute = node.attributes.find(attr => attr.name && attr.name.name === 'as')
        const elementName = asAttribute?.value?.value

        context.report({
          node,
          message: `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<${elementName}>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-element
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`,
        })
      },
      // 属性を持たないパターン
      'JSXOpeningElement[name.name="Text"]:not(:has(JSXAttribute))': (node) => {
        context.report({
          node,
          message: `属性を持たないTextコンポーネントは、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-element
 - Textコンポーネントに属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
