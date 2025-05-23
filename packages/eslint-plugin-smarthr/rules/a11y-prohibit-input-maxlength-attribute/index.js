const INPUT_COMPONENT_NAMES = /((I|^i)nput|(T|^t)extarea)$/

const SCHEMA = []

const checkHasMaxLength = (attr) => attr.name?.name === 'maxLength'

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
      JSXOpeningElement: (node) => {
        if (node.name.type === 'JSXIdentifier' && INPUT_COMPONENT_NAMES.test(node.name.name) && node.attributes.find(checkHasMaxLength)) {
          context.report({
            node,
            message: `${node.name.name}にmaxLength属性を設定しないでください。
- maxLength属性がついた要素に、テキストをペーストすると、maxLength属性の値を超えた範囲が意図せず切り捨てられてしまう場合があります
- 以下のいずれかの方法で修正をおこなってください
  - 方法1: pattern属性とtitle属性を組み合わせ、form要素でラップする
  - 方法2: JavaScriptを用いたバリデーションを実装する`,
          })
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
