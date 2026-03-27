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
      'JSXOpeningElement[name.name="Text"]:has(JSXAttribute[name.name="as"]):not(:has(JSXAttribute[name.name!="as"]))': (node) => {
        const asAttribute = node.attributes.find(attr => attr.name && attr.name.name === 'as')
        const elementName = asAttribute?.value?.value || 'HTML要素'

        context.report({
          node,
          message: `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<${elementName}>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-element
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
