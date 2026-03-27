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
      'JSXOpeningElement[name.name="Text"]:not(:has(JSXAttribute[name.name!="as"]))': (node) => {
        const asAttribute = node.attributes.find(attr => attr.name && attr.name.name === 'as')
        const elementName = asAttribute?.value?.value || 'span'

        context.report({
          node,
          message: `${asAttribute ? 'as属性のみを持つ' : '属性を持たない'}Textコンポーネントは、ネイティブHTML要素（<${elementName}>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-element
 - Textコンポーネントに${asAttribute ? 'as以外の' : ''}属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
