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
      // as属性のみを持つパターン（文字列リテラルのみ）
      'JSXOpeningElement[name.name="Text"][attributes.length=1] > JSXAttribute[name.name="as"][value.type="Literal"]': (node) => {
        context.report({
          node: node.parent,
          message: `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<${node.value.value}>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-element
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`,
        })
      },
      // 属性を持たないパターン
      'JSXOpeningElement[name.name="Text"]:not(:has(JSXAttribute))': (node) => {
        context.report({
          node,
          message: `属性を持たないTextコンポーネントは、<span>に置き換えるか、要素を削除してテキストのみにすることを検討してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-element
 - Textコンポーネントに属性がない場合、直接HTML要素を使用するか、不要な要素を削除することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
