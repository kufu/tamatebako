const ERRORMESSAGE_SUFFIX = `
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-button-element
 - button要素のtype属性のデフォルトは "submit" のため、button要素がformでラップされていると意図しないsubmitを引き起こす可能性があります
 - smarthr-ui/Button, smarthr-ui/UnstyledButtonのtype属性のデフォルトは "button" になっているため、buttonから置き換えることをおすすめします`

const SCHEMA = []

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    schema: SCHEMA,
  },
  create(context) {
    return {
      [`JSXOpeningElement[name.name="button"]:not(:has(JSXAttribute[name.name="type"]))`]: (node) => {
        context.report({
          node,
          message: `button要素を利用する場合、type属性に "button" もしくは "submit" を指定してください${ERRORMESSAGE_SUFFIX}`,
        });
      },
      [`MemberExpression[object.name="styled"][property.name="button"]`]: (node) => {
        context.report({
          node,
          message: `"styled.button" の直接利用をやめ、smarthr-ui/Button、もしくはsmarthr-ui/UnstyledButtonを利用してください${ERRORMESSAGE_SUFFIX}`,
        });
      },
    }
  },
}
module.exports.schema = SCHEMA
