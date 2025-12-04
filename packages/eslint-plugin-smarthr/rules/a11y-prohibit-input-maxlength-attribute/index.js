const SCHEMA = []

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
      [`JSXOpeningElement[name.name=/((I|^i)nput|(T|^t)extarea)$/]:has(JSXAttribute[name.name="maxLength"])`]: (node) => {
        context.report({
          node,
          message: `${node.name.name}にmaxLength属性を設定しないでください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-maxlength-attribute
 - maxLength属性がついた要素に、テキストをペーストすると、maxLength属性の値を超えた範囲が意図せず切り捨てられてしまう場合があります
 - 以下のいずれかの方法で修正をおこなってください
   - 方法1: pattern属性とtitle属性を組み合わせ、form要素でラップする
   - 方法2: JavaScriptを用いたバリデーションを実装する`,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
